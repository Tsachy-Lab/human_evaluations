
/**
 * jspsych-image-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["image-button-response"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-button-response', 'stimulus', 'image');

    plugin.info = {
        name: 'image-button-response',
        description: '',
        parameters: {
            category: {
                type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
                pretty_name: 'category',
                default: undefined,
                description: 'The category label.'
            },
            compressed_html: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'compressed HTML',
                default: '<img src="%compressedURL%" id="compressed_html">',
                array: true,
                description: 'The html of the compressed image.'
            },
	    original_html: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'original HTML',
                default: '<img src="%originalURL%" width="auto" id="original_html">',
                array: true,
                description: 'The html of the original image.'
            },
            session_id: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'session id',
                default: 'default_session_id',
                array: true,
                description: 'The unique identifer for each image'
            },
            upper_bound:{
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'upper_bound',
                default: '0',
                array: true,
                description: 'The upper bound label of the rating'
            },
            lower_bound:{
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'lower_bound',
                default: '0',
                array: true,
                description: 'The lower bound label of the rating'
            },
            choices: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Choices',
                default: undefined,
                array: true,
                description: 'The labels for the buttons.'
            },
            button_html: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button HTML',
                default: '<button class="jspsych-btn" disabled="true">%choice%</button>',
                array: true,
                description: 'The html of the button. Can create own style.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed under the button.'
            },
            message: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Message',
                default: null,
                description: 'Ask the mturker to pay attention to some specific details.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            trial_num: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial number',
                default: null,
                description: 'The number id of the current trial for each player'
            },
            margin_vertical: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin vertical',
                default: '0px',
                description: 'The vertical margin of the button.'
            },
            margin_horizontal: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '8px',
                description: 'The horizontal margin of the button.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, then trial will end when user responds.'
            },
        }
    }

    plugin.trial = function(display_element, trial) {

        var start_time = 0;
        function show_display() {

            var html = "";

            // display the prompt
            if (trial.prompt !== null) {
                var html = '<div id="prompt">' + trial.prompt + '</div>';
            }
	    console.log("prompt" + trial.prompt);
            // display the message
            if (trial.message !== null) {
                html += '<div class="msg-alert" id="message">' + trial.message.alert + '</div>';
            }
		
	    // Create large image container
            html += '<div id="img_container", class="box", align="center">';
            
            // place original image inside the image container (which has fixed location)
            html += '<div id="original_container", class="A">';
            var original_html_replaced = trial.original_html.replace('%originalURL%', trial.original_url);
            console.log('original_html_replaced' + original_html_replaced);
            html += original_html_replaced;
	    html += '</div>';
            // add compressed image into second image container
            html += '<div id="compressed_container", class="B">';
            var compressed_html_replaced = trial.compressed_html.replace('%compressedURL%', trial.compressed_url);
            html += compressed_html_replaced;
            html += '</div>';

            html += '</div>';

            //display buttons
            var buttons = [];
            if (Array.isArray(trial.button_html)) {
                if (trial.button_html.length == trial.choices.length) {
                    buttons = trial.button_html;
                } else {
                    console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
                }
            } else {
                for (var i = 0; i < trial.choices.length; i++) {
                    buttons.push(trial.button_html);
                }
            }
            html += '<div id="jspsych-image-button-response-btngroup"> <label id="lower_bound"><b>' + trial.lower_bound.toUpperCase()
                + '</b></label>';

            for (var i = 0; i < trial.choices.length; i++) {
                var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
                html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:' + trial.margin_vertical + ' ' + trial.margin_horizontal + '" id="jspsych-image-button-response-button-' + i + '" data-choice="' + i + '">' + str + '</div>';
            }
            html += '<label id="upper_bound"><b>' + trial.upper_bound.toUpperCase() + '</b></label></div>';

            display_element.innerHTML = html;
            setTimeout(function(){after_observation();},2000);
        }

        function after_observation(){
            $('.jspsych-btn').attr("disabled", false);
            // $('#message').removeClass('msg-alert').addClass('msg-continue').html(trial.message.continue);
	    
            // start timing
            start_time = performance.now();

            for (var i = 0; i < trial.choices.length; i++) {
            display_element.querySelector('#jspsych-image-button-response-button-' + i).addEventListener('click', function (e) {
                var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                after_response(choice);
            });
            }
	    
        }

        // wait for a little bit for data to come back from db (at least 1500ms), then show_display
        setTimeout(function() {show_display(); }, 1500);

        // store response
        var response = {
            rt: null,
            button: null
        };

        // function to handle responses by the subject
        function after_response(choice) {

            // measure rt
            var end_time = performance.now();
            var rt = end_time - start_time;
            response.button = choice;
            response.rt = rt;

            // disable all the buttons after a response
            var btns = document.querySelectorAll('.jspsych-image-button-response-button button');
            for(var i=0; i<btns.length; i++){
                //btns[i].removeEventListener('click');
                btns[i].setAttribute('disabled', 'disabled');
            }

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        // function to end trial when it is time
        function end_trial() {
	    var turkInfo = jsPsych.turk.turkInfo();
	    
            // data saving
            var trial_data = {
                dbname:'human_compression',
                colname: 'bpg_hc_eval',
                iterationName: 'testing',                
                reaction_time: response.rt,
                compressed_url: trial.compressed_url,
                original_url: trial.original_url,
                compression_level: trial.compression_level,
                compression_mode: trial.compression_mode,
                filename: trial.filename,
                resized_height: trial.resized_height,
                image_name: trial.image_name,
                choices: trial.choices,
                session_id: trial.session_id,
                game_id: trial.gameid,
		button_pressed: response.button,
                category: trial.category,
                trialNum: trial.trialNum,
                startTrialTime: start_time,
                endTrialTime: Date.now(),
		workerId: turkInfo.workerId,
		hitID: turkInfo.hitId,
		aID: turkInfo.assignmentId
	    };

            // clear the HTML in the display element
            display_element.innerHTML = '';


            // end trial
            jsPsych.finishTrial(trial_data);


        };



        // hide image if timing is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-image-button-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if time limit is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();
