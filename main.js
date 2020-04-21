function start(pressedBtn){
    var file = document.getElementById("inputFile");

    if(file.files.length){ //if file exists
        var reader = new FileReader();
        reader.readAsText(file.files[0]);
        var title = file.files[0].name;  //later iteraten
        
        reader.onload = function(e){
            if(title.endsWith(".srt")){
                var rawsub = e.target.result;
                converted = convert(rawsub, title);
                if(pressedBtn == "download"){
                    download(converted, "converted");
                }
                else if(pressedBtn == "show"){
                    show(converted)
        }   }   }
    }   
}

function convert(rawsub, title){
    title = title.replace(".srt", "");
    var text = title + "\n";
    text = text + "—".repeat(title.length) + "\n";
    let lines = rawsub.split("\n");

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        if(line.includes("<i>" || line.includes("</i>"))) line = line.replace("<i>", "");
        if(line.includes("</i>")) line = line.replace("</i>", "");
        if( line.includes("-->") || parseInt(line)){
            continue
        }
        text = text + line + "\n";
    }
    return text;
}

function show(data){
    document.getElementById("text").innerText = data;
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