var oldCallback;
var score = 0;
var num_trials = 78
var catch_freq = Math.round(num_trials/5);
console.log(catch_freq);
var json = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "./bpg_hc_stimuli.json",
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
console.log(json)

function sendData() {
    console.log('sending data to mturk');
    jsPsych.turk.submitToTurk({'score':score});
    
}

var consentHTML = {
    'str1' : ['<p>In this HIT, you will view reconstructions of images. Your task is to rate each reconstruction on a 5-point scale. </p>',
  	      '<p>We expect this hit to take approximately 15 minutes to complete, including the time it takes to read instructions.</p>',
              "<p>Please pay attention and do your best! Thank you!</p><p> Note: We recommend using Chrome. We have not tested this HIT in other browsers.</p>"].join(' '),
    'str2' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
        "<p id='legal'>By completing this hit, you are participating in a study being performed by electrical engineers and cognitive scientists in the Stanford Departments of Electrical Engineering and of Psychology. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you.</p>"].join(' ')
};

var instructionsHTML = {
    'str1' : ["<p> Here’s how the hit will work: </p> <p> On each trial, you will see a pair of images. The image on the left is an original image. The image on the right is a reconstruction of the image on the left. The reconstruction was produced using some lossy compression technique.</p>",
             "<p> Your goal is to rate how well the reconstruction preserves the important content of the original image, and the arrangement of that content. The rating scale ranges from 1 (POOR) to 5 (EXCELLENT).</p>"].join(' '),
    'str2': ["<p> Here’s how the hit will work: </p> <p> On each trial, you will see a pair of images. The image on the left is an original image. The image on the right is a reconstruction of the image on the left. The reconstruction was produced using some lossy compression technique.</p>",
	    "<p> Your goal is to rate how well the reconstruction preserves the important content of the original image, and the arrangement of that content. The rating scale ranges from 1 (POOR) to 5 (EXCELLENT).</p> <p> Here are three sample images: </p>",
	     '<div class="eg_div"><img class="eg_img" src="img/boats.png"><img class="eg_img" src="img/chairs.png"><img class="eg_img" src="img/shannon.jpg"></div>',
	     "<p> Here are some reconstructions of those images that should be given a score of 5 (EXCELLENT) and some reconstructions that should be given a score of 1 (POOR).</p>",
	     '<p> Example reconstructions with score 5. Note that "reconstructions" are not perfect, but are still excellent representations of the original image: </p>',
             '<div class="eg_div"><img class="eg_img" src="img/boats_spade.png"><img class="eg_img" src="img/chairs_bpg40.png"><img class="eg_img" src="img/shannon_bpg40.png"></div>',
              '<p> Example reconstructions with score 1: </p>',
	      '<div class="eg_div"><img class="eg_img" src="img/boats_150pxw_bpg51.png"><img class="eg_img" src="img/bears.jpg"><img class="eg_img" src="img/shannon_100pxw_bpg51.png"></div>'].join(' '),
    'str3': ['<p> If you notice any of the following, this should reduce the score you assign to that reconstruction:</p>',
        '<ul><li>Adding extra objects to or omitting objects from the reconstruction </li>',
        '<li>Transformations to objects that make them unrecognizable</li></ul>'].join(' '),
    'str4':['<p> Please take your time to provide as accurate of a rating as you can.</p>',
            "<p> When you finish, please click the submit button to finish the game. If a popup appears asking you if you are sure you want to leave the page, you must click YES to confirm that you want to leave the page. This will cause the HIT to submit. Let's begin!"].join(' ')
};



var welcomeTrial = {
    type: 'instructions',
    pages: [
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str1,
        instructionsHTML.str2,
        instructionsHTML.str3,
        instructionsHTML.str4,
    ],
    show_clickable_nav: true,
    allow_keys:  true
};

var acceptHTML = {
    'str1' : '<p> Welcome! In this HIT, you will view some drawings produced by children who were trying to trace a shape as accurately as they could. Your task is to rate each tracing on a 5-point scale. </p>',
    'str2' : '<p> This is only a demo! If you are interested in participating, please accept the HIT in MTurk before continuing further. </p>'
}

var previewTrial = {
    type: 'instructions',
    pages: [acceptHTML.str1, acceptHTML.str2],
    show_clickable_nav: true,
    allow_keys: false
}

var goodbyeTrial = {
    type: 'instructions',
    pages: [
        '<p> Once you click the submit button, you will be prompted with a pop-up asking you if you are sure that you want to leave the site. Please click YES to leave the site, which will trigger submission of this HIT to Amazon Mechanical Turk. </p>'
    ],
    show_clickable_nav: true,
    allow_backward:false,
    button_label_next: 'Submit the HIT',
    on_finish: function() { sendData();}
};

// define trial object with boilerplate
function Trial () {
    this.type = 'image-button-response';
    this.iterationName = 'testing';
    this.dev_mode = false;
    this.prompt = "Please rate your satisfaction with the image on the right, which is a reconstruction of the image on the left.";
    this.image_url = "img/catch.png";
    this.category ='catch';
    this.choices = ['1','2','3','4','5'];
    this.dev_mode = false,
    this.upper_bound = "EXCELLENT";
    this.lower_bound = "POOR";
    this.age = 11;
    this.session_id = '22222222222';
}

function setupGame () {

    // number of trials to fetch from database is defined in ./app.js
    var socket = io.connect();
    socket.on('onConnected', function(d) {
        // shuffle json data
        var jsonShuffled = _.shuffle(json);

        // get workerId, etc. from URL (so that it can be sent to the server)
        var turkInfo = jsPsych.turk.turkInfo();

        // pull out info from server
        var id = d.id;

        // at end of each trial save score locally and send data to server
        var main_on_finish = function(data) {
            if (data.score) {
                score = data.score;
            }
            socket.emit('currentData', data);
        };

        var main_on_start = function(trial) {
            
            trial.compression_level = jsonShuffled[trial.trialNum].compression_level;
	    trial.compression_mode = jsonShuffled[trial.trialNum].compression_mode;
            trial.filename = jsonShuffled[trial.trialNum].filename;
            trial.image_height = jsonShuffled[trial.trialNum].image_height;
            trial.image_name = jsonShuffled[trial.trialNum].image_name;
	    trial.compressed_url = jsonShuffled[trial.trialNum].compressed_url;
            trial.original_url = jsonShuffled[trial.trialNum].original_url;
            trial.choices = _.range(1, 6);


        };

        // Bind trial data with boilerplate
        var trials = _.map(_.rangeRight(num_trials), function(trialData, i) {
            return _.extend(new Trial, trialData, {
                gameID: id,
                trialNum : i,
                post_trial_gap: 1000, // add brief ITI between trials
                on_start: main_on_start,
                on_finish : main_on_finish

            });
        });

	
        // Stick welcome trial at beginning & goodbye trial at end
        if (!turkInfo.previewMode) {
            trials.unshift(welcomeTrial);
        } else {
            trials.unshift(previewTrial); // if still in preview mode, tell them to accept first.
        }
        trials.push(goodbyeTrial);

        jsPsych.init({
            timeline: trials,
            default_iti: 1000,
            show_progress_bar: true
        });
    });


}
