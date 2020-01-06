group = [];
expenses = [];
balances = [];
balances2 = [];
payments = [];

function addPerson(){
    if(group.length > 0)
    {
        document.getElementById("fg").disabled = false;
    }
    var name = document.getElementById("name").value;

    var node = document.createElement("li");
    var textNode = document.createTextNode(name);
    node.appendChild(textNode);
    document.getElementById("people").appendChild(node);

    group.push(name);
}

function removeLatest(){
    var list = document.getElementById("people");
    list.removeChild(list.childNodes[list.childNodes.length-1]);
    group.splice(group.length-1, 1);
}

function finalizeGroup(){
    document.getElementById("event").disabled = false;
    document.getElementById("payer").disabled = false;
    document.getElementById("mon").disabled = false;
    document.getElementById("remove").disabled = true;
    document.getElementById("fg").disabled = true;
    document.getElementById("name").value = "";
    document.getElementById("add").disabled = true;
    document.getElementById("addExp").disabled = false;
    document.getElementById("removeExp").disabled = false;

    for(var i = 0; i< group.length; i++)
    {
        var node2 = document.createElement("option");
        var text = document.createTextNode(group[i]);
        node2.appendChild(text);
        document.getElementById("payer").appendChild(node2);
    }

    for(var i = 0; i< group.length; i++)
    {
        document.getElementById("selector").innerHTML += group[i];
        var node = document.createElement("input");
        node.setAttribute('type', 'checkbox');
        node.setAttribute('id', group[i]);
        var text = document.createTextNode(group[i]);
        node.appendChild(text);
        document.getElementById("selector").appendChild(node);
        document.getElementById("selector").innerHTML += "   ";
    }
}

function addExpense(){
    var desc = document.getElementById("event").value;
    var payer = document.getElementById("payer").value;
    var a = document.getElementById("mon").value;
    document.getElementById("fe").disabled = false;
    var amount = parseFloat(a);
    var moochers = " -";
    mooch = [];

    for(var i = 0; i < group.length; i++)
    {
        if(document.getElementById(group[i]).checked == true)
        {
            mooch.push(i);
            moochers += " ";
            moochers += group[i];

            moochers += ",";
        } 
    }

    moochers = moochers.substring(0, moochers.length-1);
    var payIndex = 0;

    for(var i = 0; i < group.length; i++)
    {
        if(group[i] == payer)
        {
            payIndex = i;
        }
    }

    var node = document.createElement("li");
    var textNode = document.createTextNode(payer + " payed $" + amount + " for " + desc + " for " + moochers);
    node.appendChild(textNode);
    document.getElementById("exp").appendChild(node);
    expense = {payIndex, amount, mooch};
    expenses.push(expense);
}

function finalizeExpenses(){
    document.getElementById("calc").disabled = false;
    document.getElementById("fe").disabled = true;
    document.getElementById("addExp").disabled = true;
    document.getElementById("removeExp").disabled = true;
}

function removeLatestExpense(){
    var list = document.getElementById("exp");
    list.removeChild(list.childNodes[list.childNodes.length-1]);
    expenses.splice(expenses.length-1, 1);
}

function calculateDebts(){
    document.getElementById("console").disabled = false;
    document.getElementById("calc").disabled = true;
    fillDebts();

    for(var i = 0; i < expenses.length; i++)
    {
        var minus = expenses[i].amount/expenses[i].mooch.length;

        balances[expenses[i].payIndex] += expenses[i].amount;

        for(var j = 0; j < expenses[i].mooch.length; j++)
        {
            balances[expenses[i].mooch[j]] -= minus;
        }
    }

    for(var i = 0; i< balances.length; i++)
    {
        var n = group[i];
        var b = parseFloat(balances[i].toFixed(2)); //maybe wierd
       
        balances2.push({n, b});
    }

    balances2.sort(compare);
    var spi = smallestPositiveIndex();
    var hni = spi + 1;
    var going = true;

    while(going)
    {
        if(balances2[spi].b > Math.abs(balances2[hni].b))
        {
            balances2[spi].b += balances2[hni].b;
            amount = Math.abs(balances2[hni].b).toFixed(2);
            balances2[hni].b = 0;

            payer = balances2[hni].n;
            reciever = balances2[spi].n;

            hni++;

            trans = {payer, reciever, amount};
            payments.push(trans);
        }
        else if(balances2[spi].b.toFixed(2) == Math.abs(balances2[hni].b.toFixed(2)))
        {
            payer = balances2[balances2.length -1].n;
            reciever = balances2[0].n;
            amount = Math.abs(balances2[0].b).toFixed(2);

            hni++;
            spi--;

            trans = {payer, reciever, amount};
            payments.push(trans);
        }
        else
        {
            balances2[hni].b += balances2[spi].b;
            amount = Math.abs(balances2[spi].b).toFixed(2);
            balances2[spi].b = 0;
            

            payer = balances2[hni].n;
            reciever = balances2[spi].n;
            
            spi--;

            trans = {payer, reciever, amount};
            payments.push(trans);
        }

        if(hni > balances2.length-1 || spi < 0)
        {
            going = false;
        }
    }

    displayBalances();
    displayPayments();
}

function displayBalances(){
    document.getElementById("pee").innerHTML = "balances:";

    for(var i = 0; i< balances.length; i++)
    {
        var node = document.createElement("li");
        var textNode = document.createTextNode(group[i] + ":  $"  + balances[i].toFixed(2));
        node.appendChild(textNode);
        document.getElementById("bals").appendChild(node);
    }
}

function displayPayments(){
    document.getElementById("par").innerHTML = "it would take " + payments.length + " payments to even out all debts:";

    for(var i = 0; i< payments.length; i++)
    {
        var node = document.createElement("li");
        var textNode = document.createTextNode(payments[i].payer + " pays " + payments[i].reciever + " $" + payments[i].amount);
        node.appendChild(textNode);
        document.getElementById("pays").appendChild(node);
    }
}

function smallestPositiveIndex(){
    var max = 0;

    for(var i = 0; i < balances2.length; i++)
    {
        if(balances2[i].b > max)
        {
            max = balances2[i].b;
        }
    }

    var sp = max;

    for(var i = 0; i < balances2.length; i++)
    {
        if(balances2[i].b < sp && balances2[i].b > 0)
        {
            sp = balances2[i].b;
        }
    }

    for(var i = 0; i < balances2.length; i++)
    {
        if(balances2[i].b == sp)
        {
            return i;
        }
    }
}

function compare(a, b){
    return b.b - a.b;
}

function fillDebts(){
    for(var i = 0; i < group.length; i++)
    {
        balances.push(0);
    }
}

function consoleEverything(){
    console.log("group: ");
    console.log(group);
    console.log("expenses: ");
    console.log(expenses);
    console.log("balances: ");
    console.log(balances);
    console.log("payments: ");
    console.log(payments);
}



