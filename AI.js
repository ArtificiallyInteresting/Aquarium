class AI {
    constructor() {
        var num_inputs = 22; // 11 eyes, each one can see a wall and food
        var num_actions = 5; // 5 possible angles agent can turn
        var temporal_window = 1;
        var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

        var layer_defs = [];
        layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
        layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});//Maybe sigmoid?
        layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
        layer_defs.push({type:'regression', num_neurons:num_actions});

        var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};

        //I'm mostly just using the default options here.
        var opt = {};
        opt.temporal_window = temporal_window;
        opt.experience_size = 20000;
        opt.start_learn_threshold = 1000;
        opt.gamma = 0.7;
        opt.learning_steps_total = 50000;
        opt.learning_steps_burnin = 3000;
        opt.epsilon_min = 0.05;
        opt.epsilon_test_time = 0.05;
        opt.layer_defs = layer_defs;
        opt.tdtrainer_options = tdtrainer_options;

        self.brain = new deepqlearn.Brain(num_inputs, num_actions, opt);
    }

    getAction(observation) {
        var action = brain.forward(observation);
        return action;
    }
    processReward(reward) {
        //The brain will associate this reward with the last action it gave us.
        brain.backward(reward); 
    }
} 