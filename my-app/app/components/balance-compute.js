import Ember from 'ember';

export default Ember.Component.extend({
    users: [],
    expenses: [],
    balances: [],
    success: false,
    failure: false,
    actions: {
        computeBalances: function () {
            this.set('failure', true);
            var balance = {};
            let users = this.get("users");
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users.length; j++) {
                    if (users[i].name !== users[j].name) {
                        var nameID = users[i].name;
                        nameID = nameID + '-';
                        nameID = nameID + users[j].name;
                        balance[nameID] = 0;
                    }
                }
            }
            this.send("computeExpenses", balance);
        },
        computeExpenses: function (balance) {
            let expenses = this.get("expenses");
            for (var i = 0; i < expenses.length; i++) {
                var to = expenses[i].to_id.split(",");
                var amount = expenses[i].amount / to.length;
                for (var j = 0; j < to.length; j++) {
                    if (expenses[i].from_id !== to[j]) {
                        var nameFrom = expenses[i].from_id;
                        nameFrom += '-';
                        nameFrom += to[j];
                        balance[nameFrom] += amount;
                    }
                }
            }
            this.send("finalExpenseCalculation", balance);
        },
        finalExpenseCalculation: function (balance) {
            var count = 0;
            let users = this.get("users");
            for (var i = 0; i < users.length; i++) {
                for (var j = i + 1; j < users.length; j++) {
                    var tempBalance = {};
                    var idFrom = users[i].name + '-' + users[j].name;
                    var idTo = users[j].name + '-' + users[i].name;
                    if ((balance[idFrom] > balance[idTo]) && ((balance[idFrom] - balance[idTo]) >= 1)) {
                        tempBalance.amount = balance[idFrom] - balance[idTo];
                        tempBalance.amount = tempBalance.amount.toFixed(2);
                        tempBalance.willGive = users[j].name;
                        tempBalance.willGet = users[i].name;
                        tempBalance.id = count;
                        this.get("balances").pushObject(tempBalance);
                        count += 1;
                    }
                    if ((balance[idTo] > balance[idFrom]) && ((balance[idTo] - balance[idFrom]) >= 1)) {
                        tempBalance.amount = balance[idTo] - balance[idFrom];
                        tempBalance.amount = tempBalance.amount.toFixed(2);
                        tempBalance.willGive = users[i].name;
                        tempBalance.willGet = users[j].name;
                        tempBalance.id = count;
                        this.get("balances").pushObject(tempBalance);
                        count += 1;
                    }
                }
            }
        },
        settlement: function(exp) {
            var expense = {};
            var temp = "";
            expense.amount = exp.amount;
            expense.description = "Settlement";
            var d = new Date();
            expense.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            expense.from_id = exp.willGive;
            expense.to_id = exp.willGet;
            temp = JSON.stringify(expense);
            this.sendAction('action', temp);
            this.set('success', true);
            Ember.run.later((function () {
                window.location.reload(true);
            }), 1500);
        },
        export: function() {
            var i = 0;
            var row = "";
            var headers = [];
            var JSONData = this.get("balances");
            var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            if (true) {
                row = "";
                headers = ["TO GIVE", "TO RECEIVE", "AMOUNT"];
                for (i = 0; i < headers.length; i++) {
                    row += headers[i] + ',';
                }
                row = row.slice(0, -1);
                CSV += row + '\r\n';
            }
            for (i = 0; i < arrData.length; i++) {
                row = "";
                headers = [];
                headers = ["willGive", "willGet", "amount"];
                for (var j = 0; j < headers.length; j++) {
                    var index = headers[j];
                    row += '"' + arrData[i][index] + '",';
                }
                row.slice(0, row.length - 1);
                CSV += row + '\r\n';
            }
            if (CSV === '') {        
                alert("Invalid data");
                return;
            }   
            var fileName = "Settlements";
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
            var link = document.createElement("a");    
            link.href = uri;
            link.download = fileName + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
});
