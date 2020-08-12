// TODO iets aan de onderkant als er nog niks geconvert i

let count = -1;

function start(pressedBtn){
    count++;
    var file = document.getElementById("inputFile");

    if(file.files.length){ //if file exists
        var reader = new FileReader();
        reader.readAsText(file.files[0]);
        var title = file.files[0].name;  //iteraten voor zip
        newTextArea(title);
        reader.onload = function(e){
                var rawsub = e.target.result;
                if(title.endsWith(".srt")){
                    converted = convertSrt(rawsub, title); // 0-plain 1-txt
                    title = title.replace(".srt", "");
                }
                else if(title.endsWith(".ass")){
                    converted = convertAss(rawsub, title);  //0-plain 1-txt
                    title = title.replace(".ass", "");
                }
                document.getElementsByClassName("hiddenOutput")[count].innerHTML = converted[1];
                if(pressedBtn == "show"){
                    show(converted[0], title);
                }
        }    
    }  
    changeTitleLinkState();
    window.addEventListener('scroll', changeTitleLinkState);
}

function newTextArea(title){
    var index = count;

    var copyBtn = document.createElement("button");
    copyBtn.className = "copyBtn";
    copyBtn.onclick = function() {copyTxt(index, title);}
    copyBtn.type = "button";
    copyBtn.innerHTML = "<img src='/img/copyicon.png'/><strong>Copy</strong>";
    var openTxtBtn = document.createElement("button");
    openTxtBtn.className = "openTxt";
    openTxtBtn.onclick = function() {openTxt(index);}
    openTxtBtn.type = "button";
    openTxtBtn.innerHTML = "<img src='/img/txtfileicon.png'/><strong>Open</strong>";
    var title_h2 = document.createElement("h2");
    title_h2.className = "title";
    var text_p = document.createElement("p");
    text_p.className = "text";
    var hiddenOutput_p = document.createElement("p");
    hiddenOutput_p.className = "hiddenOutput";

    var textAreaDiv = document.createElement("div");
    textAreaDiv.className = "textArea";
    textAreaDiv.appendChild(openTxtBtn); textAreaDiv.appendChild(copyBtn);
    textAreaDiv.appendChild(title_h2); textAreaDiv.appendChild(text_p);
    textAreaDiv.appendChild(hiddenOutput_p); document.body.appendChild(textAreaDiv);

    if(count == 0){
        homelinkBtn = document.createElement("button");
        homelinkBtn.innerText = "Home"
        homelinkBtn.className = "homelink";
        homelinkBtn.type = "button";
        homelinkBtn.onclick = function() {
            document.getElementById("mainContainer").scrollIntoView(); window.scrollBy(0, -100);}
        document.getElementById("navlist").appendChild(homelinkBtn);

        resetBtn = document.createElement("button");
        resetBtn.innerText = "Reset";
        resetBtn.className = "resetBtn";
        resetBtn.type = "button";
        resetBtn.onclick = function() { refreshPage(); }
        document.getElementById("navlist").appendChild(resetBtn);

    }
    var titlelinkBtn = document.createElement("button");
    titlelinkBtn.className = "titlelink";
    titlelinkBtn.type = "button";
    titlelinkBtn.innerText = title.replace(".srt", "").replace(".ass", "");
    titlelinkBtn.onclick = function() {
        document.getElementsByClassName("textArea")[index].scrollIntoView(); window.scrollBy(0, -50);}
    document.getElementById("navlist").appendChild(titlelinkBtn);
}

function convertSrt(rawsub, title){
    let lines = rawsub.split("\n");
    var text = "";
    title = title.replace(".srt", "");
    var txtText = title + "\n" + "—".repeat(title.length) + "\n";

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        if(parseInt(line)){continue}
        else if( line.length <= 1){continue}
        else if( line.includes("-->")) {
            var time = line.substring(0, line.indexOf(","));
            var htmlTime = "<span id='time'>" + time + "</span>"; 
            continue}
        else{
            text = text + htmlTime + line + "<br>";
            var txtLine = line;

            if(line.includes("<i>") || line.includes("</i>")) 
                txtLine = line.replace("<i>", "");
            if(line.includes("</i>")) 
                txtLine = line.replace("</i>", "");
            txtText = txtText + txtLine + "\n\n";
        }
    }
    var textList = [text, txtText];
    return textList;
}

function convertAss(rawsub, title){
    rawsub = rawsub.substring(rawsub.indexOf("Dialogue:"), rawsub.length);
    rawsub = rawsub.replace(/{\\i1}/g, "").replace(/{\\i0}/g, "").replace(/\\N/g, " ");
    let lines = rawsub.split("\n");
    let text = "";
    title = title.replace(".ass", "");
    let txtText = title + "\n" + "—".repeat(title.length) + "\n";
    

    let actorColor = {};
    const colors = ["#E67E22", "#F1C40F", "#2ECC71", "#1ABC9C", "#1ABC9C", "#3498DB", "#9B59B6", "#E74C3C"];

    let previousactor;
    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];

        let splittedLine = [];
        if(line.includes("0,0,0,,")) {
            splittedLine = line.split("0,0,0,,"); }
        else if(line.includes("00,00,00,,")) {
            splittedLine = line.split("00,00,00,,"); }
        else if(line.includes("000,000,000,,")) {
            splittedLine = line.split("000,000,000,,"); }
        else if(line.includes("0000,0000,0000,,")) {
            splittedLine = line.split("0000,0000,0000,,"); }


        if(splittedLine[1]) { // the line exists
            let time = splittedLine[0];
            time = time.substring(time.indexOf(",") +1, time.indexOf("."));
            if(time.substring(0, time.indexOf(":")) <= 24){
                time = "0" + time;
            }
            let htmlTime = "<span id='time'>" + time + "</span>";

            let actor = "";
            if(!splittedLine[0].includes(",Default,")){
                const info = splittedLine[0].split(',');
                actor = info[info.length - 2];
                
                if(!(actor in actorColor)) {
                    actorColor[actor] = colors[Math.floor(Math.random() * colors.length)];
                }
                if(previousactor !== actor) {
                    if(actor !== "") {
                        htmlTime = "</br> <span id='actor' style='color:" + actorColor[actor] + "'>" + actor.charAt(0).toUpperCase() + actor.slice(1) + "</span>" + "</br>" + htmlTime;
                    }
                    else {
                        htmlTime = "</br>" + htmlTime;
                    }
                }
                previousactor = actor;
            }
            
            let lineText = splittedLine[1];
            let txtLineText = lineText.replace(/\\N/g, "\n");
            lineText = lineText + "<br>";
            txtLineText = txtLineText + "\n\n";
            txtText = txtText + txtLineText;
            lineText = lineText.replace(/\\N/g, "<br>");
            lineText = lineText.replace(/{[^}]*}/g, "");
            text = text + htmlTime + lineText;
        }
    }
    const textList = [text, txtText];

    return textList;
}

function show(data, title){
    var titleElement = document.getElementsByClassName("title")[count];
    var textArea = document.getElementsByClassName("textArea")[count];
    titleElement.innerText = title;

    textArea.className = "textArea";
    document.getElementsByClassName("text")[count].innerHTML = data;

    document.getElementsByClassName("textArea")[count].scrollIntoView(); window.scrollBy(0, -50);
}

function openTxt(index){
    var hiddenText = document.getElementsByClassName("hiddenOutput")[index].innerHTML;
    download(hiddenText, "converted", "text/plain;charset=utf-8");
}

function copyTxt(index, title){
    var textToCopy = document.getElementsByClassName("hiddenOutput")[index].innerText;
    navigator.clipboard.writeText(textToCopy);
    alert("Copied subtitles from:\n" + title);
}

function download(data, filename, type){
    var file = new Blob([data], {type: type});
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

function changeTitleLinkState(){
    let titlelinks = document.querySelectorAll(".titlelink");
    let textareas = document.querySelectorAll(".textArea");
    
    if(textareas){
        let index = textareas.length;

        while(--index && window.scrollY + 50 < textareas[index].offsetTop) {}
    
        titlelinks.forEach((titlelink) => titlelink.classList.remove("active"));
        titlelinks[index].classList.add("active");
    }
}

function refreshPage(){
    location.reload();
}
