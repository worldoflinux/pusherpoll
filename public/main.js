const form = document.getElementById('vote-form');
var event;

form.addEventListener('submit', e=>{
    
    const choice = document.querySelector('input[name=os]:checked').value;
    const data = {os: choice};

    fetch('http://localhost:3000/poll',{
        method: 'post',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(res => res.json())
    .catch(err => console.log(err));

    e.preventDefault();
});

fetch("http://localhost:3000/poll")
    .then(res => res.json())
    .then(data => {
        let votes = data.votes;
        let totalVotes = votes.length;
        document.querySelector('#chartTitle').textContent = `Total Votes: ${totalVotes}`;
       // document.querySelector('#pieChart').textContent= `Total Votes: ${totalVotes}`;

        let voteCounts = {
            Windows: 0,
            MacOS: 0,
            Linux: 0,
            Other: 0
        };

        voteCounts = votes.reduce((acc, vote) => (
            (acc[vote.os] = (acc[vote.os] || 0) + parseInt(vote.points)), acc),
            {}
        );

        let dataPoints = [
            { label: 'Windows', y: voteCounts.Windows },
            { label: 'MacOS', y: voteCounts.MacOS },
            { label: 'Linux', y: voteCounts.Linux },
            { label: 'Other', y: voteCounts.Other }
        ];
            
        const chartContainer = document.querySelector('#chartContainer');
        const pieContainer = document.querySelector('#pieContainer');
        
        if (chartContainer) {

            // Listen for the event.
            document.addEventListener('votesAdded', function (e) {
                document.querySelector('#chartTitle').textContent = `Total Votes: ${e.detail.totalVotes}`;
            });

            const chart = new CanvasJS.Chart('chartContainer', {
                animationEnabled: true,
                theme: 'light2',
                title: {
                    text: "Vot pe Candidati la Presedentie"
                },
                subtitles: [{
                    text: "Romania Noiembrie 2019",
                    fontSize: 16
                }],
                data: [
                    {
                        type: 'column',
                        dataPoints: dataPoints,
                        indexLabelFontSize: 18,
                        //radius: 80,
                        indexLabel: "{label} - {y}",
                        yValueFormatString: "###0.0\"%\""
                        //click: explodePie
                    }
                ]
            });
            chart.render();

            // Enable pusher logging - don't include this in production
            Pusher.logToConsole = true;

            var pusher = new Pusher('3150db8636b70635f80b', {
                cluster: 'eu',
                encrypted: true
            });

            var channel = pusher.subscribe('voting-poll');

            channel.bind('os-vote', function (data) {
                dataPoints.forEach((point) => {
                    if (point.label == data.os) {
                        point.y += data.points;
                        totalVotes += data.points;
                        event = new CustomEvent('votesAdded', { detail: { totalVotes: totalVotes } });
                        // Dispatch the event.
                        document.dispatchEvent(event);
                    }
                });
                chart.render();
                
            });
        }
if(pieContainer){
    document.addEventListener('votesAdded', function (e) {
        document.querySelector('#pieChart').textContent = `Total Votes: ${e.detail.totalVotes}`;
    });

    var pieChart = new CanvasJS.Chart('pieContainer', {
        animationEnabled: true,
        theme: 'light2',
        data: [{
            type: "pie",
            indexLabelFontSize: 18,
            radius: 80,
            indexLabel: "{label} - {y}",
            yValueFormatString: "###0.0\"%\"",
           // click: explodePie,
            dataPoints: dataPoints
                
        
        }]
    });
    pieChart.render();

    var pusher = new Pusher('3150db8636b70635f80b', {
        cluster: 'eu',
        encrypted: true
    });

    var channel = pusher.subscribe('voting-poll');

    channel.bind('os-vote', function (data) {
        dataPoints.forEach((point) => {
            if (point.label == data.os) {
                point.y += data.points;
                totalVotes += data.points;
                event = new CustomEvent('votesAdded', { detail: { totalVotes: totalVotes } });
                // Dispatch the event.
                document.dispatchEvent(event);
            }
        });
        pieChart.render();

       
        
    });
}
});
