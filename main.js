function start(pressedBtn){
    var file = document.getElementById("inputFile");

    if(file.files.length){ //if file exists
        var reader = new FileReader();
        reader.readAsText(file.files[0]);
        var title = file.files[0].name;  //later iteraten
        
        reader.onload = function(e){
            if(title.endsWith(".srt")){
                var rawsub = e.target.result;
                converted = convert(rawsub, pressedBtn, title);
                document.getElementsByClassName("hiddenOutput")[0].innerText = converted;
                if(pressedBtn == "download"){
                    download(converted, "converted");
                }
                else if(pressedBtn == "show"){
                    show(converted, title);
        }   }   }
    }   
}

function convert(rawsub, pressedBtn, title){
    let lines = rawsub.split("\n");
    var text = "";
    if(pressedBtn == "download"){
        title = title.replace(".srt", "");
        text = title + "\n" + "—".repeat(title.length) + "\n";
    }

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        if(parseInt(line)){continue}
        else if( line.length <= 1){continue}
        else if( line.includes("-->")) {
            if(pressedBtn == "show"){
                var time = line.substring(0, line.indexOf(","));
                var htmlTime = "<span id='time'>" + time + "</span>"; 
            }continue}
        else{
            if(pressedBtn == "show"){
                text = text + htmlTime + line + "<br>";
            }
            else if(pressedBtn == "download"){
                if(line.includes("<i>") || line.includes("</i>")) line = line.replace("<i>", "");
                if(line.includes("</i>")) line = line.replace("</i>", "");
                text = text + line + "\n\n";
            }
        }
    }
    return text;
}

function show(data, title){
    var titleElement = document.getElementsByClassName("title")[0];
    var textArea = document.getElementsByClassName("textArea")[0];
    title = title.replace(".srt", "");
    titleElement.innerText = title;

    // textArea.className = textArea.className.replace("disabled", "active");
    textArea.className = "textArea enabled";
    // document.getElementById("text").innerText = data;
    document.getElementsByClassName("text")[0].innerHTML = data;


    document.getElementsByClassName("textArea")[0].scrollIntoView({behavior: "smooth"});
}

function download(data, filename){
    var file = new Blob([data], {type: "text/plain;charset=utf-8"});
    if(window.navigator.msSaveOrOpenBlob) //IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else{ //wacky browsers
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}


var copyBtn = document.getElementById("copyBtn");
var clipboard = new ClipboardJS(copyBtn);

clipboard.on('success', function(e){
    console.log(e);
});
clipboard.on('error', function(e){
    console.log(e);
});

// var textToCopy = document.getElementsByClassName("hiddenOutput")[0];
// var textToCopy = document.getElementsByClassName("textArea")[0];
// textToCopy.select();
// // textToCopy.setSelectionRange(0, 99999); //for mobile devices
// // document.execCommand("copy");
// document.execCommand("copy");