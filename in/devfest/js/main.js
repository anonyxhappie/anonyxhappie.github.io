var config = {
    apiKey: "AIzaSyB7OBVdghZHJ0-VKlC9wq1EWAFxute-IGM",
    authDomain: "time-tracking-b4b81.firebaseapp.com",
    databaseURL: "https://time-tracking-b4b81.firebaseio.com",
    projectId: "time-tracking-b4b81",
    storageBucket: "time-tracking-b4b81.appspot.com",
    messagingSenderId: "251184367762"
  };
firebase.initializeApp(config);
var feedbackRef = firebase.database().ref('feedback');      

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