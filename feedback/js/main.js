// Initialize Firebase
var config = {
apiKey: "AIzaSyB7OBVdghZHJ0-VKlC9wq1EWAFxute-IGM",
authDomain: "time-tracking-b4b81.firebaseapp.com",
databaseURL: "https://time-tracking-b4b81.firebaseio.com",
projectId: "time-tracking-b4b81",
storageBucket: "time-tracking-b4b81.appspot.com",
messagingSenderId: "251184367762"
};

firebase.initializeApp(config);

var dataRef = firebase.database().ref('feedback');

    dataRef.on('child_added', function(snapshot){
        var newF = snapshot.val();
        createFeedbackElement(newF.name, newF.feedback);
    });
// dataRef.on('value', function(data){
//     data.forEach(function(element) {
//         var newF = element.val();
//         createFeedbackElement(newF.name, newF.feedback);    
//     });
//     if(data.numChildren() != document.getElementById('feedback').childElementCount){
//         location.reload();
//     }
// });

function createFeedbackElement(name, feedback){        
    var nameH3 = document.createElement('h3');
    var nameTextNode = document.createTextNode(name);
    nameH3.appendChild(nameTextNode);
    
    var feedbackP = document.createElement('p');
    var feedbackTextNode = document.createTextNode(feedback);
    feedbackP.appendChild(feedbackTextNode);

    var divElement = document.createElement('div');
    divElement.appendChild(nameH3);
    divElement.appendChild(feedbackP);

    var feedbackDiv = document.getElementById('feedback');
    feedbackDiv.appendChild(divElement);
}
