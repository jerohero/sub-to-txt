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
            if(title.endsWith(".srt")){
                var rawsub = e.target.result;
                converted = convert(rawsub, title); // 0-plain 1-txt
                document.getElementsByClassName("hiddenOutput")[count].innerHTML = converted[1];
                if(pressedBtn == "show"){
                    show(converted[0], title);
                }
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
    // openTxtBtn.onclick = function() {openTxt(index);}
    // openTxtBtn.type = "button";
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
    }
    var titlelinkBtn = document.createElement("button");
    titlelinkBtn.className = "titlelink";
    titlelinkBtn.type = "button";
    titlelinkBtn.innerText = title.replace(".srt", "");
    titlelinkBtn.onclick = function() {
        document.getElementsByClassName("textArea")[index].scrollIntoView(); window.scrollBy(0, -50);}
    document.getElementById("navlist").appendChild(titlelinkBtn);
}

function convert(rawsub, title){
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

function show(data, title){
    var titleElement = document.getElementsByClassName("title")[count];
    var textArea = document.getElementsByClassName("textArea")[count];
    title = title.replace(".srt", "");
    titleElement.innerText = title;

    textArea.className = "textArea";
    document.getElementsByClassName("text")[count].innerHTML = data;

    document.getElementsByClassName("textArea")[count].scrollIntoView(); window.scrollBy(0, -50);
}

function openTxt(index){
    var hiddenText = document.getElementsByClassName("hiddenOutput")[index].innerHTML;
    download(hiddenText, "converted");
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
    let textareas = document.querySelectorAll(".textArea");
    
    if(textareas){
        let index = textareas.length;

        while(--index && window.scrollY + 50 < textareas[index].offsetTop) {}
    
        titlelinks.forEach((titlelink) => titlelink.classList.remove("active"));
        titlelinks[index].classList.add("active");
    }
}
