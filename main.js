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
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeArea";
    closeBtn.onclick = function() {closeTextArea(index);}
    closeBtn.type = "button";
    closeBtn.innerHTML = "&#10006;";
    var title_h2 = document.createElement("h2");
    title_h2.className = "title";
    var text_p = document.createElement("p");
    text_p.className = "text";
    var hiddenOutput_p = document.createElement("p");
    hiddenOutput_p.className = "hiddenOutput";

    var textAreaDiv = document.createElement("div");
    textAreaDiv.className = "textArea";
    textAreaDiv.appendChild(closeBtn);
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
    }
    var titlelinkBtn = document.createElement("button");
    titlelinkBtn.className = "titlelink";
    titlelinkBtn.type = "button";
    titlelinkBtn.innerText = title.replace(".srt", "").replace(".ass", "");
    titlelinkBtn.onclick = function() {
        document.getElementsByClassName("textArea")[index].scrollIntoView(); window.scrollBy(0, -50);}
    document.getElementById("navlist").appendChild(titlelinkBtn);
}

function closeTextArea(index){
    var textArea = document.getElementsByClassName("textArea")[index];
    // document.body.removeChild(textArea);
    
    // textArea.removeChild();
    // document.getElementsByClassName("copyBtn")[index].remove;
    // console.log("ehe");
    
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
    rawsub = rawsub.replace(/{\\i1}/g, "").replace(/{\\i0}/g, "");
    let lines = rawsub.split("\n");
    var text = "";
    title = title.replace(".ass", "");
    var txtText = title + "\n" + "—".repeat(title.length) + "\n";
    

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        let splittedLine = line.split("Default");
        let time = splittedLine[0];
        time = time.substring(time.indexOf(",") +1, time.indexOf("."));
        if(time.substring(0, time.indexOf(":")) <= 24){
            time = "0" + time;
        }
        var htmlTime = "<span id='time'>" + time + "</span>"; 
        
        let lineText = splittedLine[1];
        lineText = lineText.substring(9);
        var txtLineText = lineText.replace(/\\N/g, "\n");
        lineText = lineText + "<br>";
        txtLineText = txtLineText + "\n\n";
        txtText = txtText + txtLineText;
        lineText = lineText.replace(/\\N/g, "<br>");
        text = text + htmlTime + lineText;
    }
    
    var textList = [text, txtText];
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
    download(hiddenText, "converted");
}

function copyTxt(index, title){
    var textToCopy = document.getElementsByClassName("hiddenOutput")[index].innerText;
    navigator.clipboard.writeText(textToCopy);
    alert("Copied subtitles from:\n" + title);
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

function changeTitleLinkState(){
    let titlelinks = document.querySelectorAll(".titlelink");
    // let textareas = document.querySelectorAll(".textArea");
    let textareas = document.body.getElementsByClassName("textArea");
    
    if(textareas){
        let index = textareas.length;

        while(--index && window.scrollY + 50 < textareas[index].offsetTop) {}
    
        titlelinks.forEach((titlelink) => titlelink.classList.remove("active"));
        titlelinks[index].classList.add("active");
    }
}
