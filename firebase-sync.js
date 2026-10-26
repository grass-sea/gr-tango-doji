(function(){
 const cfg=window.FIREBASE_CONFIG||{};
 const configured=cfg.apiKey&&cfg.projectId&&!String(cfg.apiKey).startsWith('YOUR_')&&!String(cfg.projectId).startsWith('YOUR_');
 if(!configured){window.cloudSync={configured:false};return}
 try{
  firebase.initializeApp(cfg);
  const auth=firebase.auth(),db=firebase.firestore();let user=null;
  const api={configured:true,get user(){return user},signIn:()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),signOut:()=>auth.signOut(),push:async data=>{if(!user)return;await db.collection('users').doc(user.uid).set({backup:data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})},
   publishLibrary:async library=>{if(!user)throw new Error('not-signed-in');const ref=library.id?db.collection('libraries').doc(library.id):db.collection('libraries').doc();const data={...library,id:ref.id,ownerId:user.uid,ownerName:user.displayName||user.email||'Người dùng',updatedAt:firebase.firestore.FieldValue.serverTimestamp()};await ref.set(data,{merge:true});return ref.id},
   getLibrary:async id=>{const snap=await db.collection('libraries').doc(id).get();return snap.exists?snap.data():null},
   addComment:async (id,comment)=>{if(!user)throw new Error('not-signed-in');await db.collection('libraries').doc(id).collection('comments').add({...comment,authorId:user.uid,authorName:user.displayName||user.email||'Người dùng',createdAt:firebase.firestore.FieldValue.serverTimestamp()})},
   listComments:async id=>{const snap=await db.collection('libraries').doc(id).collection('comments').orderBy('createdAt','asc').limit(100).get();return snap.docs.map(x=>({id:x.id,...x.data()}))},
   addReport:async (id,report)=>{if(!user)throw new Error('not-signed-in');await db.collection('libraries').doc(id).collection('reports').add({...report,reporterId:user.uid,reporterName:user.displayName||user.email||'Người dùng',status:'open',createdAt:firebase.firestore.FieldValue.serverTimestamp()})},
   listReports:async id=>{const snap=await db.collection('libraries').doc(id).collection('reports').orderBy('createdAt','desc').limit(100).get();return snap.docs.map(x=>({id:x.id,...x.data()}))},
   updateReport:async (id,reportId,data)=>{await db.collection('libraries').doc(id).collection('reports').doc(reportId).update(data)}
  };
  window.cloudSync=api;
  auth.onAuthStateChanged(async next=>{
   user=next;
   let guestBackup=null;
   if(window.onCloudUserChanged)guestBackup=await window.onCloudUserChanged(user?user.uid:null);
   if(user){try{const snap=await db.collection('users').doc(user.uid).get();if(snap.exists&&snap.data().backup&&window.onCloudData)await window.onCloudData(snap.data().backup);else if(guestBackup&&window.onCloudInitialData)await window.onCloudInitialData(guestBackup);else if(window.libraryBackup)api.push(window.libraryBackup())}catch(e){console.error('Firebase sync read failed',e)}}
   if(window.onCloudAuthChanged)window.onCloudAuthChanged(user);
  });
 }catch(e){console.error('Firebase chưa được cấu hình đúng',e);window.cloudSync={configured:false,error:e}}
})();
