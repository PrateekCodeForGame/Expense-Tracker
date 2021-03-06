import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.hash({
            users: Ember.$.get('http://localhost:5000/api/person'),
            expenses: Ember.$.get('http://localhost:5000/api/expense')
        });
    },
    actions: {
    	makeSettlement: function(expense) {
			Ember.$.ajaxSetup({
	                contentType: "application/json"
	            });
            Ember.$.post('http://localhost:5000/api/expense', expense);
    	}
    }
});
