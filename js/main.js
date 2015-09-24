var highScore = 0;
var score = 0;
var timeLeft = 120;
var questionsAndAnswers = [];
var copyOfQuestionsAndAnswers = [];
var abbreviations = {};
var gameOver = false;
var timer = setInterval(function() { updateTimer(); }, 1000);
var baseURL = window.location.href.substring(0, window.location.href.length-10);

function shuffle(array) {
	for(var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
	return array;
}

function updateHighScore() {
	if(score > highScore) {
		highScore = score;
		document.getElementById("highScore").innerHTML = "High Score: " + highScore;
	}
}

function finishGame() {
	gameOver = true;
	timeLeft = -2;
	document.getElementById("question").innerHTML = "Click 'restart' to play again!";
	document.getElementById("inputState").value = "";
	if(score === 10) {
		alert("Game over! Great job, you scored " + score + "/10!");
	} else {
		incorrectResponses = "\n";
		for(var i=0; i<questionsAndAnswers.length; i++) {
			incorrectResponses += "\n" + (i+1) + ". " + questionsAndAnswers[i][0] + " Answer: " + questionsAndAnswers[i][1];
		}
		questionsAndAnswers = [];
		alert("Game over! Good effort, you scored " + score + "/10. The correct responses to the questions you did not answer are..." + incorrectResponses);
	}
}

function renderQuestion() {
	document.getElementById("question").innerHTML = questionsAndAnswers[0][0];
}

function checkResponse() {
	if(!gameOver) {
		var response = document.getElementById("inputState").value.toLowerCase().replace(/^\s+|\s+$/g, '');
		var answer = questionsAndAnswers[0][1].toLowerCase();
		var abbreviatedAnswer = abbreviations[questionsAndAnswers[0][1]].toLowerCase();
		if(response === answer || response === abbreviatedAnswer) {
			score += 1;
			document.getElementById("currentScore").innerHTML = "Current Score: " + score;
			updateHighScore();
			document.getElementById("inputState").value = "";
			questionsAndAnswers.shift();
			if(score === 10) {
				finishGame();
			} else {
				renderQuestion();
			}
		}
	}
}

function skip() {
	toBeSkipped = questionsAndAnswers[0];
	questionsAndAnswers.shift();
	questionsAndAnswers.push(toBeSkipped);
	document.getElementById("inputState").value = "";
	document.getElementById("inputState").focus();
	renderQuestion();
}

function restart() {
	updateHighScore();
	gameOver = false;
	questionsAndAnswers = shuffle(copyOfQuestionsAndAnswers.slice());
	score = 0;
	document.getElementById("currentScore").innerHTML = "Current Score: " + score;
	document.getElementById("inputState").value = "";
	document.getElementById("inputState").focus();
	renderQuestion();
	document.getElementById("timeLeft").innerHTML = "Time Remaining: " + 120 + " seconds";
	startTimer(120);
}

function updateTimer() {
	timeLeft -= 1;
	if(timeLeft >= 0) {
		document.getElementById("timeLeft").innerHTML = "Time Remaining: " + timeLeft + " seconds";
	} else if(timeLeft === -1) {
		finishGame();
	}
}

function startTimer(time) {
	timeLeft = time;
	timer.clearInterval();
	timer = setInterval(function() { updateTimer(); }, 1000);
}

function readAbbreviationsFiles(fileName) {
	$.get(baseURL+fileName, function(data) {
		var output = data.split("\n");
		for(var i=0; i<output.length; i++) {
			output[i] = output[i].replace(/^\s+|\s+$/g, '').split("\t");
			abbreviations[output[i][0]] = output[i][1];
		}
	});
}
readAbbreviationsFiles("static/abbreviations.txt");

function readQuestionsAndAnswers(questionsFile, answersFile) {
	$.get(baseURL+questionsFile, function(data) {
		var questionsList = data.split("\n");
		for(var i=0; i<questionsList.length; i++) {
			questionsList[i] = questionsList[i].replace(/^\s+|\s+$/g, '');
		}
		$.get(baseURL+answersFile, function(data) {
			var answersList = data.split("\n");
			for(var i=0; i<answersList.length; i++) {
				answersList[i] = answersList[i].replace(/^\s+|\s+$/g, '');
				questionsAndAnswers[i] = [questionsList[i], answersList[i]];
			}
			shuffle(questionsAndAnswers);
			copyOfQuestionsAndAnswers = questionsAndAnswers.slice();
			renderQuestion();
		});
	});
}
readQuestionsAndAnswers("static/questions.txt", "static/answers.txt");