
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg === 'url-update') {
		setTimeout(grabProfs, 1000);
		setTimeout(runExtension, 1000);
	}

});
//Grabs the names of the professor an element and adds a class name to the element
function grabProfs(){
	var professorElementNode;
	var tableElementNode = document.querySelectorAll('.section-detail-grid.table-bordered-wrap>tbody>tr>td>div');
	for (var i = 0; i < tableElementNode.length; i++) {
		if(tableElementNode[i].children.length < 1 && tableElementNode[i].innerText != 'Not Assigned') {
			tableElementNode[i].className = 'professor';
		}
	}
}


function runExtension(){
	var professorsArray = [];
	var professorElementNode = document.querySelectorAll('.professor');
	for (var i = 0; i < professorElementNode.length; i++) {
		var professorName = professorElementNode[i].innerText;
		professorName = professorName.trim();
		professorName = professorName.replace(/,/g, '');
		professorName = professorName.split([' ']);
		var firstName = professorName[1];
		var lastName = professorName[0];
		professorsArray[i] = {
			first: firstName,
			last: lastName,
		};
		$('.rating').remove();
		$('.review').remove();
	}
// Adds an element and inserts text  for the rating and review count underneath the professor element
for (var i = 0; i < professorElementNode.length; i++) {	
	var rating;
	var wouldTakeAgain;
	var difficulty;
	var pkID;	
	const parentNode = professorElementNode[i].parentNode;
	const ratingElement = document.createElement('a');
	const tooltiptext = document.createElement('span')
	const reviewElement = document.createElement('a');
	parentNode.appendChild(ratingElement);
	parentNode.appendChild(reviewElement);
	reviewElement.className = 'review';
	ratingElement.className = 'rating';

	var profUrl = 'https://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=20&q=' + professorsArray[i].first +'+'+ professorsArray[i].last + '+AND+schoolid_s%3A1262&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=';
	Get(profUrl, function(err, data) {
		pkID = data.response.docs.map(doc => doc.pk_id);
		if (pkID[0] == null){
			reviewElement.innerText = "Professor not found";
		}
		var ratingCount = data.response.docs.map(doc => doc.total_number_of_ratings_i);
		Get('https://www.ratemyprofessors.com/ShowRatings.jsp?tid='+ pkID[0], function(err, data){
			let dom = document.createElement('html');
			dom.innerHTML = data;
			let elements = Array.from(dom.getElementsByClassName('grade'));
			elements.length = 3; 
			rating = elements[0].innerHTML;
			wouldTakeAgain = elements[1].innerHTML;
			difficulty = elements[2].innerHTML;
			ratingElement.innerText = rating;
			ratingElement.appendChild(tooltiptext);
			tooltiptext.className = 'tooltiptext';
			tooltiptext.innerText = 'Would take again: '+ wouldTakeAgain + ' Level of difficulty: ' +difficulty ;
			reviewElement.href = 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + pkID[0];
			ratingElement.href = 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + pkID[0];
			reviewElement.innerText = ' - ' + ratingCount[0] + ' reviews';
			if (rating >= 3.5 && rating <= 5){
				ratingElement.style.color = '#b4d235';
			} else if (rating >= 2.5 && rating[0] < 3.5){
				ratingElement.style.color = '#f7cc20';
			} else if (rating >= 1 && rating < 2.5){
				ratingElement.style.color = '#df3d5f';
			}
			if (typeof ratingCount == 'undefined'){
				reviewElement.innerText = "Professor not found";
				ratingElement.innerText = "Professor not Found";
			}
		});
	});
}
function Get(url, callback) {
	var xhr = new XMLHttpRequest();
	if (url.indexOf('ratemyprofessors.com') > -1){
		xhr.responseType = 'text';
	}
	else {
		xhr.responseType = 'json';
	}
	xhr.onload = function() {
		var status = xhr.status;
		if (status === 200) {
			callback(null, xhr.response);
		} else {
			callback(status, xhr.response);
		}
	};
	xhr.open('GET', url, true);
	xhr.send();
};



}









