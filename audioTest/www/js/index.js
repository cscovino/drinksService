var app = {
    my_media: '',

    model: {},

    first: false,

    notification: false,

    modelMeet: {
        'titulo': '',
        'fecha': '',
        'users':[]
    },

    order: [],

    meets: [],

    odd: 0,

    firebaseConfig: {
    apiKey: "AIzaSyC50skbZWPdmbhMgSz9ulM8pBJ8r8F8lag",
    authDomain: "drinksmenu-ab56b.firebaseapp.com",
    databaseURL: "https://drinksmenu-ab56b.firebaseio.com",
    projectId: "drinksmenu-ab56b",
    storageBucket: "drinksmenu-ab56b.appspot.com",
    messagingSenderId: "495209622347"
    },

    playAudio: function(){
        $('#myModal').modal('show');
        var p = window.location.pathname;
        var aux = p.substring(0,p.lastIndexOf('/'));
        var url = aux+'/sounds/office_phone.mp3';
        app.my_media = new Media(url,null,function(err){alert(JSON.stringify(err));});
        app.my_media.play();
        app.notification = true;
    },

    receivedOrder: function(){
        app.my_media.stop();
        app.notification = false;
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
            right: 'month,agendaWeek,agendaDay'
          },
          buttonText: {
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day'
          },
          editable: false,
          draggable: false,
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
                    codigo += '<th>Empresa</th>';
                    codigo += '<th>Nombre</th>';
                    codigo += '<th>Bebida</th>';
                        codigo += '<th>Comentario</th>';
                codigo += '</tr>';
            for (var i=0; i<app.order['orders'].length; i++) {
                for(var key in app.order['orders'][i]){
                    for(var key2 in app.order['orders'][i][key]){
                        codigo += '<tr>';
                            codigo += '<td>'+key+'</td>'
                            codigo += '<td>'+key2+'</td>';
                            codigo += '<td>'+app.order['orders'][i][key][key2]['Bebida']+'</td>';
                            codigo += '<td>'+app.order['orders'][i][key][key2]['Coment']+'</td>';
                        codigo += '</tr>';
                    }
                }
            }
                codigo += '</tbody>';
            codigo += '</table>';
            users.append(codigo);
        }
        app.order = [];
        if (!app.notification && app.first) {
            app.playAudio();
            setTimeout(function(){
                emailjs.send("gmail","alerta",{});
            }, 60000);
        }
        app.first = true;
    },

    refreshCalendar: function(snap){
        app.model.meetings = snap;
        $('#calendar').fullCalendar('removeEvents');
        for(var key in app.model.meetings){
            var dateVar = app.model.meetings[key]['fecha'].split(' ');
            var yearVar = dateVar[0].split("/")[2];
            var monthVar = dateVar[0].split("/")[0];
            var dayVar = dateVar[0].split("/")[1];
            var yearVarE = dateVar[4].split("/")[2];
            var monthVarE = dateVar[4].split("/")[0];
            var dayVarE = dateVar[4].split("/")[1];
            var hVar = dateVar[1].split(':')[0];
            if (dateVar[2] === 'PM') {
                hVar = +hVar + 12;
                if (hVar === 24) {
                    hVar = 00;
                }
            }
            var mVar = dateVar[1].split(':')[1];
            var hVarE = dateVar[5].split(':')[0];
            if (dateVar[6] === 'PM') {
                hVarE = +hVarE + 12;
                if (hVarE === 24) {
                    hVarE = 00;
                }
            }
            var mVarE = dateVar[5].split(':')[1];
            var ttE = app.model.meetings[key]['titulo'];
            var eventsE = {
                title: ttE,
                start: new Date(yearVar,monthVar-1,dayVar,hVar,mVar),
                end: new Date(yearVarE,monthVarE-1,dayVarE,hVarE,mVarE),
                allDay: false,
                backgroundColor: "#0073b7",
                borderColor :"#0073b7"
            };

            $('#calendar').fullCalendar('renderEvent', eventsE);
            eventsE = '';
        }
    },
};

app.setCalendar();
emailjs.init("user_E6w9y3AjySOWMQGes6bIy");

firebase.initializeApp(app.firebaseConfig);
firebase.database().ref('inventory').on('value', function(snap){
    if (snap.val() !== null) {
        //app.setSnap(snap.val());
    }
});
firebase.database().ref('meetings').on('value', function(snap){
    if (snap.val() !== null) {
        app.refreshCalendar(snap.val());
    }
});
firebase.database().ref('order').on('value', function(snap){
    if (snap.val() !== null) {
        app.refreshOrders(snap.val());
    }
});