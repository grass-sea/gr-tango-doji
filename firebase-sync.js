(function(){
 const cfg=window.FIREBASE_CONFIG||{};
 const configured=cfg.apiKey&&cfg.projectId&&!String(cfg.apiKey).startsWith('YOUR_')&&!String(cfg.projectId).startsWith('YOUR_');
 if(!configured){window.cloudSync={configured:false};return}
 try{
  firebase.initializeApp(cfg);
  const auth=firebase.auth(),db=firebase.firestore();let user=null;
  const api={configured:true,get user(){return user},signIn:()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()),signOut:()=>auth.signOut(),push:async data=>{if(!user)return;await db.collection('users').doc(user.uid).set({backup:data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})}};
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
