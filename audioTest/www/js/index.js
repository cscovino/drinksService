var app = {

    my_media: '',

    model: {},

    first: false,

    notification: false,

    order: [],

    orders: [],

    fecha:'',

    odd: 0,

    numOrder: 0,

    inventory: {},

    time: {},

    firebaseConfig: {
        apiKey: "AIzaSyCkQaGeVx7aqj0Gt2C15i8BdzSup3yNQuM",
        authDomain: "reuniones-46a77.firebaseapp.com",
        databaseURL: "https://reuniones-46a77.firebaseio.com",
        projectId: "reuniones-46a77",
        storageBucket: "reuniones-46a77.appspot.com",
        messagingSenderId: "888234651975"
    },

    playAudio: function(){
        $('#myModal').modal('show');
        var p = window.location.pathname;
        var aux = p.substring(0,p.lastIndexOf('/'));
        var url = aux+'/sounds/office_phone.mp3';
        app.my_media = new Media(url,null,function(err){alert(JSON.stringify(err));},app.onStatus);
        app.my_media.play();
        app.notification = true;
    },

    onStatus: function(status){
        if (status == Media.MEDIA_STOPPED) {
            if (app.notification) {
                app.my_media.play();
            }
        }
    },

    receivedOrder: function(){
        app.my_media.stop();
        app.notification = false;
        clearTimeout(app.time);
    },

    setCalendar: function(){
        var date = new Date();
        var d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear();
        $('#calendar').fullCalendar({
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'agendaWeek,agendaDay'
          },
          buttonText: {
            today: 'today',
            week: 'week',
            day: 'day'
          },
          editable: false,
          draggable: false,
          allDaySlot: false,
          minTime: '8:00:00',
          maxTime: '18:00:00',
          defaultView: 'agendaWeek'
        });
    },

    refreshOrders: function(snap){
        app.order = jQuery.extend(true,{},snap);
        if (app.order['orders'].length > 0) {
            var users = $('#orders');
            users.html('');
            var codigo = '<table class="table table-bordered"';
            codigo += '<tbody>';
                codigo += '<tr>';
                    codigo += '<th>Nombre</th>';
                    codigo += '<th>Bebida</th>';
                    codigo += '<th>Comentario</th>';
                    codigo += '<th>Sala</th>';
                codigo += '</tr>';
            for (var i=0; i<app.order['orders'].length; i++) {
                for(var key in app.order['orders'][i]){
                    if (app.order['orders'][i][key]['entregado'] === 1) {
                        codigo += '<tr style="text-decoration:line-through;color:#ccc;">';
                    }
                    else{
                        codigo += '<tr id="'+key.replace(' ','-')+'_'+app.order['orders'][i][key]['Bebida'].replace(' ','-')+'" onclick="app.confirmDelivered(this);">';
                    }
                        var id = app.order['orders'][i][key]['meetId'];
                        codigo += '<td>'+key+'</td>';
                        codigo += '<td>'+app.order['orders'][i][key]['Bebida']+'</td>';
                        codigo += '<td>'+app.order['orders'][i][key]['Coment']+'</td>';
                        codigo += '<td>'+app.model[id]['sala']+'</td>'
                    codigo += '</tr>';
                }
            }
                codigo += '</tbody>';
            codigo += '</table>';
            users.append(codigo);
        }
        if(!app.first){
            app.numOrder = app.order['orders'].length;
            app.fecha = app.order['fecha'];
        }
        if (app.fecha != app.order['fecha'] && app.order['orders'].length <= app.numOrder && app.first) {
            app.numOrder = app.order['orders'].length;
            app.fecha = app.order['fecha'];
            if (!app.notification && app.first) {
                app.playAudio();
                app.time = setTimeout(function(){
                    emailjs.send("gmail","alerta",{});
                    app.receivedOrder();
                }, 120000);
            }
        }
        else if (app.order['orders'].length > app.numOrder && app.first) {
            app.numOrder = app.order['orders'].length;
            if (!app.notification && app.first) {
                app.playAudio();
                app.time = setTimeout(function(){
                    emailjs.send("gmail","alerta",{});
                    app.receivedOrder();
                }, 120000);
            }
        }
        else{
            app.numOrder = app.order['orders'].length;
        }
        app.first = true;
        app.order = [];
    },

    confirmDelivered: function(data){
        document.getElementById('aux-div').innerHTML = data.id;
        $('#myModal2').modal('show');
    },

    deliveredOrder: function(){
        var id = document.getElementById('aux-div').innerHTML;
        var client = id.split('_')[0].replace('-',' ');
        var drink = id.split('_')[1].replace('-',' ');
        for (var i=0; i<app.orders['orders'].length; i++) {
            for(var key in app.orders['orders'][i]){
                if (key === client) {
                    if (app.orders['orders'][i][key]['Bebida'] === drink) {
                        app.orders['orders'][i][key]['entregado'] = 1;
                        var fechaAct = new Date();
                        var hact = fechaAct.getHours();
                        var mact = fechaAct.getMinutes();
                        app.orders['orders'][i][key]['horae'] = hact+':'+mact;
                    }
                }
            }
        }
        firebase.database().ref('order').update(app.orders);
        document.getElementById(id).style.textDecoration = 'line-through';
        document.getElementById(id).style.backgroundColor = '#a3a3a3';
    },

    refreshCalendar: function(snap){
        app.model.meetings = snap;
        $('#calendar').fullCalendar('removeEvents');
        for(var key in app.model.meetings){
            var dateVar = app.model.meetings[key]['fecha'].split(' ');
            var yearVar = dateVar[0].split("/")[2];
            var monthVar = dateVar[0].split("/")[0];
            var dayVar = dateVar[0].split("/")[1];
            var hVar = dateVar[1].split(':')[0];
            if (dateVar[2] === 'PM') {
                hVar = +hVar + 12;
                if (hVar === 24) {
                    hVar = 00;
                }
            }
            var mVar = dateVar[1].split(':')[1];
            var hVarE = dateVar[4].split(':')[0];
            if (dateVar[5] === 'PM') {
                hVarE = +hVarE + 12;
                if (hVarE === 24) {
                    hVarE = 00;
                }
            }
            var mVarE = dateVar[4].split(':')[1];
            var ttE = app.model.meetings[key]['sala']+' - '+app.model.meetings[key]['titulo'];
            var eventsE = {
                title: ttE,
                start: new Date(yearVar,monthVar-1,dayVar,hVar,mVar),
                end: new Date(yearVar,monthVar-1,dayVar,hVarE,mVarE),
                allDay: false,
                backgroundColor: "#0073b7",
                borderColor :"#0073b7",
            };

            $('#calendar').fullCalendar('renderEvent', eventsE, 'stick');
            eventsE = '';
        }
        $('#calendar').fullCalendar({

        });
    },

    showplus: function(){
        document.getElementById('okButton').style.display = 'inline-block';
        var buttons = document.getElementsByClassName('glyphicon');
        for(var i=0; i<buttons.length; i++){
            buttons[i].style.display = 'inline-block';
        }
    },

    hideplus: function(){
        document.getElementById('okButton').style.display = 'none';
        var buttons = document.getElementsByClassName('glyphicon');
        for(var i=0; i<buttons.length; i++){
            buttons[i].style.display = 'none';
        }
        firebase.database().ref('inventory').set(app.inventory);
    },

    refreshInventory: function(){
        for(var key in app.inventory){
            var bar = 'bar-'+key;
            document.getElementById(key).innerHTML = app.inventory[key]+'/10';
            var percent = app.inventory[key]*100/10;
            document.getElementById(bar).style.width = percent+'%';
            if (percent < 33) {
                document.getElementById(bar).className = 'progress-bar progress-bar-danger';
            }
            else if (percent < 66) {
                document.getElementById(bar).className = 'progress-bar progress-bar-warning';
            }
            else {
                document.getElementById(bar).className = 'progress-bar progress-bar-success';
            }
        }
    },

    add: function(item){
        app.inventory[item.id] += 1;
        if (app.inventory[item.id] > 10) {
            app.inventory[item.id] = 10;
        }
        app.refreshInventory();
    }
};

app.setCalendar();
emailjs.init("user_E6w9y3AjySOWMQGes6bIy");

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function(){
        FastClick.attach(document.body);
    }, false);
};

firebase.initializeApp(app.firebaseConfig);
firebase.database().ref('inventory').on('value', function(snap){
    if (snap.val() !== null) {
        app.inventory = snap.val();
        //app.refreshInventory();
    }
});
firebase.database().ref('meetings').on('value', function(snap){
    if (snap.val() !== null) {
        app.model = snap.val();
        app.refreshCalendar(snap.val());
    }
});
firebase.database().ref('order').on('value', function(snap){
    if (snap.val() !== null) {
        app.orders = jQuery.extend(true,{},snap.val());
        app.refreshOrders(snap.val());
    }
});