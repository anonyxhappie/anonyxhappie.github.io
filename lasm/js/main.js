// Encrypt this Code otherwise anyone can change your Database Schema and so more...
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('6 5={c:"d-e-b",a:"0-1-2.8.3",9:"7://0-1-2.f.3",p:"0-1-2",m:"0-1-2.l.3",k:"h"};4.i(5);6 j=4.n().g(\'o\');',26,26,'time|tracking|b4b81|com|firebase|config|var|https|firebaseapp|databaseURL|authDomain|IGM|apiKey|AIzaSyB7OBVdghZHJ0|VKlC9wq1EWAFxute|firebaseio|ref|251184367762|initializeApp|feedbackRef|messagingSenderId|appspot|storageBucket|database|feedback|projectId'.split('|'),0,{}))
     

document.getElementById('feedback-form').addEventListener('submit', submitFeedback);

function submitFeedback(event){
    event.preventDefault();

    var name = getValue('name');
    var company = getValue('company');
    var phone = getValue('phone');
    var email = getValue('email');
    var feedback = getValue('feedback');
    saveData(name, company, phone, email, feedback);
    //console.log(name + ", " + company + ", " + phone + ", " + email + ", " + feedback);
   
    document.querySelector('.success').style.display='block';
    setTimeout(function(){
        document.querySelector('.success').style.display='none';
    }, 2500);
    document.getElementById('feedback-form').reset();
}

function saveData(name, company, phone, email, feedback){
    var newFeedback = {
        name: name,
        company: company,
        phone: phone,
        email: email,
        feedback: feedback
    };
    
    feedbackRef.push().set(newFeedback);
}

function getValue(id){
    return document.getElementById(id).value;
}
