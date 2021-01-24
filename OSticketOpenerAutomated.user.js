// ==UserScript==
// @name         Automatic OSticket Opener
// @author       Matheus Augusto de Jesus Madeira
// @version      8
// @downloadURL  https://github.com/Teuzer/OSticket-Automation/raw/master/OSticketOpenerAutomated.user.js
// @updateURL    https://github.com/Teuzer/OSticket-Automation/raw/master/OSticketOpenerAutomated.user.js
// @description  Design to automate OSticket's open application.
// @require      https://cdn.jsdelivr.net/npm/notiflix@2.4.0/dist/notiflix-aio-2.4.0.min.js
// @require      https://raw.githubusercontent.com/SheetJS/sheetjs/master/dist/xlsx.full.min.js
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.min.js
// @match        http://10.154.77.34/osticket/open.php*
// @match        http://10.154.77.34/osticket/tickets.php?id=*
// @grant        none
// @run-at       document-end
// ==/UserScript==
(function() {
    if(window.location.href.includes("tickets.php?id=")){
        if(JSON.parse(localStorage.getItem("isAutoStarted")) &&
                            ((parseInt(JSON.parse(localStorage.getItem("currentItem")))) < JSON.parse(localStorage.getItem("itemStatus")).length)){
            document.querySelectorAll("#content table td small").forEach((elem)=>{
                if(elem != null){
                    if(elem.innerText.startsWith("#")){
                        if(JSON.parse(localStorage.getItem("itemStatus"))[parseInt(JSON.parse(localStorage.getItem("currentItem")))] == "Pendente"){
                            let itemStatus = JSON.parse(localStorage.getItem("itemStatus"));
                            itemStatus[parseInt(JSON.parse(localStorage.getItem("currentItem")))] = elem.innerText.substring(1);
                            localStorage.setItem("itemStatus",JSON.stringify(itemStatus));
                            localStorage.setItem("currentItem",parseInt(JSON.parse(localStorage.getItem("currentItem"))) + 1);
                            setTimeout(()=>{
                                document.querySelector("a.new").click();
                            },500);
                        }
                    }
                }
            });
        }
    }else if(window.location.href.includes("open.php")){
        if (typeof(Storage) !== "undefined") {
            Notiflix.Report.Init({});
            Notiflix.Confirm.Init({});
            Notiflix.Loading.Init({});
            if (localStorage.versionUpdate) {
                if (parseInt(JSON.parse(localStorage.getItem("versionUpdate"))) != 6) {
                     Notiflix.Confirm.Show(
                        'Atualização identificada',
                        'Uma nova versão foi identificada. Deseja atualizar agora?',
                        'Sim',
                        'Não',
                        ()=>{
                            localStorage.clear();
                            window.location.reload();
                        }, ()=>{
                        });
                }
            }
            let readTopic = ()=>{
                let maxTopicLen = document.querySelectorAll("#topicId option").length;
                let topicSelect = document.querySelector("#topicId");
                let topicOptions = [];
                let maxTopicOptionsFieldsNum = [];
                let maxHeaders = [];
                let maxFieldType = [];
                let loopFunction = (curTopic)=>{
                    if(curTopic <= maxTopicLen){
                        //adiciona seleciona o topico
                        topicOptions.push(topicSelect.querySelector("option:nth-child("+curTopic+")").innerText.toUpperCase());
                        topicSelect.value =  topicSelect.querySelector("option:nth-child("+curTopic+")").value;
                        let event = new Event('change');
                        topicSelect.dispatchEvent(event);

                        setTimeout(()=>{
                            let topicOptionsFieldsNum = 0;
                            let headers = [];
                            let fieldType = [];
                            let trLen = document.querySelectorAll("#dynamic-form tr").length;
                            let adder = 0;
                            document.querySelectorAll("#dynamic-form tr").forEach((elem)=>{
                                adder++;
                                if(elem.querySelectorAll("label").length > 0){
                                    if(headers.length == 0){
                                        headers= [elem.querySelector("label span:nth-child(1)").innerText.toUpperCase()];
                                        topicOptionsFieldsNum++;
                                    }else{
                                        headers.push(elem.querySelector("label span:nth-child(1)").innerText.toUpperCase());
                                        topicOptionsFieldsNum++;
                                    }
                                    if(elem.querySelectorAll("select").length > 0){
                                        if(fieldType.length == 0){
                                            fieldType = ["SELECT"];
                                        }else{
                                            fieldType.push("SELECT");
                                        }
                                    }
                                    if(elem.querySelectorAll("input").length > 0){
                                        if(fieldType.length == 0){
                                            fieldType = [elem.querySelector("input").type.toUpperCase()];
                                        }else{
                                            fieldType.push(elem.querySelector("input").type.toUpperCase());
                                        }
                                    }
                                    if(elem.querySelectorAll("textarea").length > 0){
                                        if(fieldType.length == 0){
                                            fieldType = ["TEXTAREA"];
                                        }else{
                                            fieldType.push("TEXTAREA");
                                        }
                                    }
                                }else if(elem.querySelectorAll("div.redactor-editor").length > 0){
                                    if(headers.length == 0){
                                        headers= ["EXPLICAÇÃO"];
                                        topicOptionsFieldsNum++;
                                    }else{
                                        headers.push("EXPLICAÇÃO");
                                        topicOptionsFieldsNum++;
                                    }
                                    if(fieldType.length == 0){
                                        fieldType = ["DETAILS"];
                                    }else{
                                        fieldType.push("DETAILS");
                                    }
                                }
                                if(trLen==adder){
                                    maxTopicOptionsFieldsNum.push(topicOptionsFieldsNum);
                                    maxHeaders.push(headers);
                                    maxFieldType.push(fieldType);

                                    setTimeout(()=>{
                                        loopFunction(curTopic+1)
                                    },1000);
                                }
                            });
                        },5000);
                    }else{
                        localStorage.topicOptions = JSON.stringify(topicOptions);
                        localStorage.topicOptionsFieldsNum = JSON.stringify(maxTopicOptionsFieldsNum);
                        localStorage.headers = JSON.stringify(maxHeaders);
                        localStorage.fieldType = JSON.stringify(maxFieldType);
                        Notiflix.Loading.Remove();
                        Notiflix.Report.Success(
                            'Tópicos Atualizados',
                            'Os tópicos foram atualizados com sucesso.',
                            'Ok',
                            ()=>{
                                window.location.reload();
                            }
                        );

                    }
                };
                loopFunction(2);
            };
            let createBehavior = (currentTopic)=>{
                let curFieldType = JSON.parse(localStorage.getItem("fieldType"))[currentTopic];
                let curTopicHeaders = JSON.parse(localStorage.getItem("headers"))[currentTopic];
                let curItem = JSON.parse(localStorage.getItem("items"))[JSON.parse(localStorage.getItem("currentItem"))].split(/\t/g);
                if(!curFieldType.includes("FILE")){
                    curFieldType.forEach((elemType,elemIndex)=>{
                        console.log(elemIndex);
                        switch(elemType){
                            case "TEXT":
                                document.querySelectorAll("#dynamic-form input").forEach((elem)=>{
                                    let elemId = elem.id.substring(1);
                                    let elemLabel = document.querySelector("#dynamic-form label[for='"+elemId+"'] span");
                                    if(elemLabel != null){
                                        if(elemLabel.innerText.toUpperCase() == curTopicHeaders[elemIndex]){
                                            if(curItem[elemIndex].toUpperCase() != "VAZIO"){
                                                elem.value = curItem[elemIndex];
                                            }
                                        }
                                    }
                                });
                            break;
                            case "TEXTAREA":
                                if(curItem[elemIndex].toUpperCase() != "VAZIO"){
                                    document.querySelectorAll("#dynamic-form label").forEach((elem)=>{
                                        if(elem.querySelector("span") != null){
                                            if(elem.querySelector("span").innerText.toUpperCase() == curTopicHeaders[elemIndex]){
                                            elem.querySelector("td div.redactor-editor").innerHTML = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                            elem.querySelector("td .redactor-box textarea").innerHTML = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                            elem.querySelector("td .redactor-box textarea").value = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                            }
                                        }
                                    });
                                }
                            break;
                            case "DETAILS":
                                if(curItem[elemIndex].toUpperCase() != "VAZIO"){
                                    document.querySelectorAll("#dynamic-form td .form-header").forEach((elem)=>{
                                        if(elem.innerText.toUpperCase().includes("DETAILS")){
                                            elem.parentNode.parentNode.nextElementSibling.querySelector("td div.redactor-editor").innerHTML = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                            elem.parentNode.parentNode.nextElementSibling.querySelector("td .redactor-box textarea").innerHTML = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                            elem.parentNode.parentNode.nextElementSibling.querySelector("td .redactor-box textarea").value = curItem[elemIndex].replace(/\r?\n/g,"<br>");
                                        }
                                    });
                                }
                            break;
                            case "SELECT":
                                if(curItem[elemIndex].toUpperCase() != "VAZIO"){
                                    document.querySelectorAll("#dynamic-form label").forEach((elem)=>{
                                        if(elem.querySelector("span") != null){
                                            if(elem.querySelector("span").innerText.toUpperCase() == curTopicHeaders[elemIndex]){
                                                elem.querySelectorAll("select option").forEach((optElem)=>{
                                                    if(optElem.innerText.toUpperCase().includes(curItem[elemIndex].toUpperCase())){
                                                        optElem.parentNode.value = optElem.value;
                                                    }
                                                    return true;
                                                });
                                                return true;
                                            }
                                        }
                                    });
                                }
                            break;
                            case "CHECKBOX":
                                document.querySelectorAll("#dynamic-form input").forEach((elem)=>{
                                    let elemId = elem.id.substring(1);
                                    let elemLabel = document.querySelector("#dynamic-form label[for='"+elemId+"'] span");
                                    if(elemLabel != null){
                                        if(elemLabel.innerText.toUpperCase() == curTopicHeaders[elemIndex]){
                                            if(curItem[elemIndex].toUpperCase() != "VAZIO"){
                                                elem.click();
                                            }
                                        }
                                    }
                                });
                            break;
                        }
                    });
                    setTimeout(()=>{
                        if(JSON.parse(localStorage.getItem("isAutoStarted")) &&
                            ((parseInt(JSON.parse(localStorage.getItem("currentItem")))) < JSON.parse(localStorage.getItem("itemStatus")).length)){
                            document.querySelector("#ticketForm > p > input[type=submit]:nth-child(1)").click();
                        }
                    },3333);
                }else{
                    Notiflix.Report.Warning(
                        'Automação não existe',
                        'Tópico não pôde ser automatizado por exigir upload de arquivos (fotos, documentos, etc)',
                        'Ok'
                    );
                }
            };
            let waiter = (autId)=>{
                setTimeout(()=>{
                    if(document.querySelector("#dynamic-form").childElementCount > 0){
                        createBehavior(autId);
                    }else{
                        waiter(autId);
                    }
                },2500);
            };
            let autoFill = (autId)=>{
                document.querySelectorAll("#topicId > option").forEach((elem,index)=>{
                    if(elem.innerText.toUpperCase().includes(JSON.parse(localStorage.getItem("topicOptions"))[autId].toUpperCase())){
                        elem.parentNode.value = elem.value;
                        let event = new Event('change');
                        elem.parentNode.dispatchEvent(event);
                        waiter(autId);
                    }
                });
            };
            let automationAction = (autId)=>{
                Notiflix.Block.Standard('#container', 'Automatizando...');
                if((autId >= 0)&&(autId <= JSON.parse(localStorage.getItem("topicOptions")).length)){
                    autoFill(autId);
                }else{
                    Notiflix.Report.Warning(
                        'Automação não existe',
                        'A automação para o tópico escolhido ainda não existe. Por favor, aguarde atualização ou solicite ao administrador do sistema.',
                        'Ok'
                    );
                }
            };
            if (!localStorage.versionUpdate) {
                localStorage.versionUpdate = 8;
            }
            if (!localStorage.isAutoStarted) {
                localStorage.isAutoStarted = false;
            }
            if (!localStorage.isModalDisplayed) {
                localStorage.isModalDisplayed = false;
            }
            if (!localStorage.isTypeSelected) {
                localStorage.isTypeSelected = false;
            }
            if (!localStorage.currentItem) {
                localStorage.currentItem = 0;
            }
            if (!localStorage.itemStatus) {
                localStorage.itemStatus = JSON.stringify([]);
            }
            if (!localStorage.topicOptions) {
                localStorage.topicOptions = JSON.stringify([]);
            }
            if (!localStorage.topicOptionsFieldsNum) {
                localStorage.topicOptionsFieldsNum = JSON.stringify([]);
            }
            if (!localStorage.headers) {
                localStorage.headers = JSON.stringify([]);
            }
            if (!localStorage.fieldType) {
                localStorage.fieldType = JSON.stringify([]);
            }else{
                if(JSON.parse(localStorage.getItem("fieldType")).length == 0){
                    Notiflix.Report.Info(
                        'Tópicos de Ajuda',
                        'É necessário preencher os Tópicos de Ajuda para utilizar o sistema.Clique no botão e aguarde terminar.',
                        'Preencher',
                        ()=>{
                            Notiflix.Loading.Hourglass('Preenchendo Tópicos...');
                            readTopic();
                        }
                    );
                }
            }
            let checkFieldLen = (topicType, columnCount)=>{
                let topicOptionsFieldsNum = JSON.parse(localStorage.getItem("topicOptionsFieldsNum"));
                if(topicOptionsFieldsNum[ parseInt(topicType) - 1] == columnCount){
                    return true;
                }else{
                    return false;
                }
            }
            const template = document.createElement('template');
            template.innerHTML = `<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.14.0/css/all.css" integrity="sha384-HzLeBuhoNPvSl5KYnjx0BT+WB0QEEqLprO+NBkkk5gbc67FTaL7XIGa2w1L0Xbgc" crossorigin="anonymous">`;
            document.head.appendChild(template.content.cloneNode(true));
            class userUi extends HTMLElement {
                constructor() {
                    super();
                    const shadow = this.attachShadow({mode: 'open'});
                    const sHTML = document.createElement('html');
                    const sHEAD = document.createElement('head');
                    const W3CSS = document.createElement('link');
                    W3CSS.setAttribute('rel', 'stylesheet');
                    W3CSS.setAttribute('href', 'https://www.w3schools.com/w3css/4/w3.css');
                    sHEAD.appendChild(template.content.cloneNode(true));
                    sHEAD.appendChild(W3CSS);
                    const sBODY = document.createElement('body');
                    sBODY.setAttribute("id","main-wrapper");
                    sBODY.setAttribute('class', 'w3-row w3-light-grey w3-topbar');
                    sBODY.style.position = "fixed";
                    sBODY.style.top = "0";
                    sBODY.style.left = "0";
                    sBODY.style.zIndex = "1000";
                    sBODY.style.fontFamily = "calibri";
                    sBODY.style.width = "200px";
                    sBODY.style.height = "100vh";
                    let leftMenu = document.createElement('div');
                    leftMenu.setAttribute("id","right-menu");
                    leftMenu.setAttribute('class', 'w3-col w3-padding-tiny w3-grey w3-margin-bottom w3-card-2');
                    leftMenu.style.width = "200px";
                    leftMenu.style.height = "100vh";
                    let modalWaiter = document.createElement('div');
                    modalWaiter.style.position = "fixed";
                    modalWaiter.style.top = "0";
                    modalWaiter.style.left = "0";
                    modalWaiter.style.width = "100vw";
                    modalWaiter.style.height = "100vh";
                    modalWaiter.style.zIndex = "9999";
                    modalWaiter.style.background = "rgba(0,0,0,0.5)";
                    modalWaiter.style.display = "none";
                    let automateBtnWrapper = document.createElement('div');
                    automateBtnWrapper.setAttribute('class','w3-col s12');
                    let modalIcon = document.createElement('i');
                    modalIcon.setAttribute('class','w3-margin-left fas fa-chevron-right');
                    let modalToggler = document.createElement('div');
                    modalToggler.setAttribute('class','w3-btn w3-section w3-padding w3-green w3-round');
                    modalToggler.style.float = "none";
                    modalToggler.style.margin = "auto";
                    modalToggler.style.display = "table";
                    modalToggler.innerText = "Abrir Painel";
                    modalToggler.addEventListener('click',()=>{
                        if(sBODY.style.width != "200px"){
                            modalIcon.setAttribute('class','w3-margin-left fas fa-chevron-right');
                            modalToggler.innerHTML = "Abrir Painel";
                            modalToggler.append(modalIcon);
                            modalToggler.classList.remove("w3-red");
                            modalToggler.classList.add("w3-green");
                            sBODY.style.width = "200px";
                            localStorage.isModalDisplayed = false;
                            automateBtnWrapper.style.display= "block";
                        }else{
                            modalIcon.setAttribute('class','w3-margin-left fas fa-chevron-left');
                            modalToggler.innerHTML = "Fechar Painel";
                            modalToggler.append(modalIcon);
                            modalToggler.classList.remove("w3-green");
                            modalToggler.classList.add("w3-red");
                            sBODY.style.width = "100%";
                            localStorage.isModalDisplayed = true;
                            automateBtnWrapper.style.display= "none";
                        }
                    },false);
                    modalToggler.append(modalIcon);
                    leftMenu.append(modalToggler);
                    leftMenu.append(automateBtnWrapper);
                    let rightWrapper = document.createElement('div');
                    rightWrapper.setAttribute("id","right-wrapper");
                    rightWrapper.setAttribute('class', 'w3-rest w3-padding-tiny w3-light-grey w3-margin-bottom');
                    rightWrapper.style.minHeight = "100vh";
                    let selectWrapper = document.createElement('div');
                    selectWrapper.setAttribute('class','w3-col s12 w3-section w3-padding w3-large');
                    if(JSON.parse(localStorage.getItem("isTypeSelected")) !== false){
                        selectWrapper.style.display = "none";
                    }

                    let selectTypeHeader = document.createElement('div');
                    selectTypeHeader.setAttribute('class','w3-col s4 w3-right-align w3-padding w3-large');
                    selectTypeHeader.innerText = "Selecione o Tópico de Ajuda:";
                    let insertIcon = document.createElement('i');
                    let insertData = document.createElement('div');
                    if(JSON.parse(localStorage.getItem("isTypeSelected")) === false){
                        let updateIcon = document.createElement('i');
                        updateIcon.setAttribute('class','w3-margin-left fas fa-retweet');
                        let updateTopics = document.createElement('div');
                        updateTopics.setAttribute('class','w3-col s4 w3-btn w3-margin-left w3-section w3-blue w3-round w3-large');
                        updateTopics.innerText = "Atualizar Tópicos de Ajuda";
                        updateTopics.append(updateIcon);
                        updateTopics.addEventListener('click',()=>{
                            Notiflix.Report.Info(
                                'Atualizar Tópicos de Ajuda',
                                'Para atualizar os Tópicos de Ajuda, clique no botão e aguarde terminar.',
                                'Preencher',
                                ()=>{
                                    Notiflix.Loading.Hourglass('Atualizando Tópicos...');
                                    readTopic();
                                }
                            );
                        });

                        let textAreaHeader = document.createElement('label');
                        textAreaHeader.setAttribute('class','w3-col s12 w3-padding w3-large w3-blue');
                        textAreaHeader.innerText = "Siga a formatação da tabela de excel correspondente ao Tópico de Ajuda.";
                        textAreaHeader.style.borderRadius = "5px 5px 0 0";

                        let s2ab = (s)=>{
                            var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
                            var view = new Uint8Array(buf);  //create uint8array as viewer
                            for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
                            return buf;
                        };
                        let downloadIcon = document.createElement('i');
                        downloadIcon.setAttribute('class','w3-margin-left fas fa-download');
                        let downloadModel = document.createElement('div');
                        downloadModel.setAttribute('class','w3-btn w3-large w3-green w3-round');
                        downloadModel.innerText = "Download Planilha Guia";
                        downloadModel.style.float = "right";
                        downloadModel.append(downloadIcon);
                        downloadModel.addEventListener("click",function(ev){
                            let topicType = document.querySelector("body > user-ui").shadowRoot.querySelector("#mine-select").value;
                            if(topicType == "none"){
                                 Notiflix.Report.Warning(
                                    'Tópico não selecionado',
                                    'Selecione o tópico de ajuda',
                                    'Ok'
                                );
                            }else{
                                let wb = XLSX.utils.book_new();
                                wb.Props = {
                                    Title: "Planilha Guia",
                                    Subject: "Test",
                                    Author: "Teuzer",
                                    CreatedDate: new Date(2014,5,12)
                                };
                                wb.SheetNames.push("Guia");
                                let ws_data = [JSON.parse(localStorage.getItem("headers"))[topicType - 1]];
                                let ws = XLSX.utils.aoa_to_sheet(ws_data);
                                wb.Sheets["Guia"] = ws;
                                var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
                                saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), JSON.parse(localStorage.getItem("topicOptions"))[topicType - 1]+'.xlsx');
                            }
                        },false);

                        let selectType = document.createElement('select');
                        selectType.setAttribute('class','w3-col s4 w3-select w3-padding');
                        selectType.setAttribute('id','mine-select');
                        selectType.addEventListener("change",function(ev){
                            /*let tableData = document.createElement('table');
                            tableData.setAttribute('class','w3-table-all');
                            let tableDataHeader = document.createElement('thead');
                            let selectHeaders = ;

                            let wb = XLSX.utils.book_new();
                            wb.Props = {
                                Title: "Planilha Guia",
                                Subject: "Test",
                                Author: "Teuzer",
                                CreatedDate: new Date(2014,5,12)
                            };
                            wb.SheetNames.push("Guia");
                            var ws_data = [selectHeaders];
                            let ws = XLSX.utils.aoa_to_sheet(ws_data);
                            wb.Sheets["Guia"] = ws;
                            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
                            //$("#button-a").click(function(){
                                saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), JSON.parse(localStorage.getItem("topicOptions"))[ev.target.value - 1]+'.xlsx');
                                //});

                            selectHeaders.forEach((elem,index)=>{
                                let th = document.createElement('th');
                                th.innerText = elem;
                                th.setAttribute('class','w3-border')
                                tableDataHeader.append(th);
                            });
                            tableData.append(tableDataHeader);
                            textAreaHeader.innerHTML = "";
                            textAreaHeader.append(tableData);
                            */
                        },false);
                        let optionType = document.createElement('option');
                        optionType.setAttribute('value',"none");
                        optionType.setAttribute('selected',"true");
                        optionType.innerText = "Selecione o Tópico de Ajuda";
                        selectType.append(optionType);
                        JSON.parse(localStorage.getItem("topicOptions")).forEach((elem,index)=>{
                            let optionType = document.createElement('option');
                            optionType.setAttribute('value',index+1);
                            optionType.innerText = elem;
                            selectType.append(optionType);
                        });
                        let textAreaWrapper = document.createElement('div');
                        textAreaWrapper.setAttribute('class','w3-col s12 w3-padding w3-large');

                        let textArea = document.createElement("textarea");
                        textArea.setAttribute('class','w3-col s12 w3-padding w3-large');
                        textArea.style.position = "relative";
                        textArea.style.height = "50vh";
                        textArea.style.resize = "none";
                        textArea.setAttribute('id', '#mine-textarea');
                        insertIcon.setAttribute('class','w3-margin-left fas fa-save');
                        insertData.setAttribute('class','w3-btn w3-section w3-margin-right w3-padding w3-green w3-round w3-large');
                        insertData.style.float = "right";
                        insertData.innerText = "Salvar Dados";
                        insertData.addEventListener('click',()=>{
                            let topicType = document.querySelector("body > user-ui").shadowRoot.querySelector("#mine-select").value;
                            let dataValue = textArea.value;
                            if(topicType == "none"){
                                 Notiflix.Report.Warning(
                                    'Tópico não selecionado',
                                    'Selecione o tópico de ajuda',
                                    'Ok'
                                );
                            }else if(dataValue.trim().length == 0){
                                Notiflix.Report.Warning(
                                    'Dados não foram preenchidos',
                                    'Por favor, preencha com os dados relacionados ao tópico.',
                                    'Ok'
                                );
                            }else{
                                let dataInsert = dataValue.split(/\r?\n/g);
                                dataInsert = dataInsert.filter((elem)=>{
                                    if(elem.length > 0){
                                        return dataInsert;
                                    }
                                });
                                let columnCount = dataInsert[0].split(/\t/g);
                                if(!checkFieldLen(topicType,columnCount.length)){
                                    Notiflix.Report.Warning(
                                        'Dados não compatíveis com tópico',
                                        'O número de colunas não bate com o número de campos para o tópico de ajuda selecionado. </br></br>Por favor, verifique os dados.',
                                        'Ok'
                                    );
                                }else{
                                    Notiflix.Report.Success(
                                        'Sucesso',
                                        'Dados inseridos com sucesso.',
                                        'Ok',
                                        ()=>{
                                            let itemStatus = []
                                            for(let i = 0; i<dataInsert.length;i++){
                                                itemStatus.push("Pendente");
                                            }
                                            localStorage.setItem("currentItem",0);
                                            localStorage.setItem("itemStatus",JSON.stringify(itemStatus));
                                            localStorage.setItem("items",JSON.stringify(dataInsert));
                                            localStorage.isTypeSelected = topicType;
                                            window.location.reload();
                                        }
                                    );
                                }
                            }
                        },false);
                        insertData.append(insertIcon);
                        selectWrapper.append(selectTypeHeader);
                        selectWrapper.append(selectType);
                        selectWrapper.append(downloadModel);
                        rightWrapper.append(selectWrapper);
                        textAreaWrapper.append(textAreaHeader);
                        textAreaWrapper.append(textArea);
                        rightWrapper.append(textAreaWrapper);
                        rightWrapper.append(updateTopics);
                    }else{
                        let automationIcon = document.createElement('i');
                        let initiateAutomation = document.createElement('div');
                        initiateAutomation.setAttribute('class','w3-btn w3-margin-bottom w3-padding w3-round');
                        initiateAutomation.style.float = "none";
                        initiateAutomation.style.margin = "auto";
                        initiateAutomation.style.display = "table";

                        if(JSON.parse(localStorage.getItem("isAutoStarted")) &&
                            ((parseInt(JSON.parse(localStorage.getItem("currentItem")))) < JSON.parse(localStorage.getItem("itemStatus")).length)){
                            automationIcon.setAttribute('class','w3-margin-left fas fa-pause');
                            initiateAutomation.classList.add("w3-red");
                            initiateAutomation.innerHTML = "Pausar Automação";
                            modalToggler.style.display= "none";
                            automationAction(JSON.parse(localStorage.getItem("isTypeSelected")) - 1);
                        }else{
                            automationIcon.setAttribute('class','w3-margin-left fas fa-play');
                            initiateAutomation.classList.add("w3-blue");
                            initiateAutomation.innerText = "Iniciar Automação";
                            modalToggler.style.display= "table";
                            localStorage.isAutoStarted = false;
                        }

                        initiateAutomation.addEventListener('click',()=>{
                            if(JSON.parse(localStorage.getItem("isAutoStarted"))){
                                automationIcon.setAttribute('class','w3-margin-left fas fa-play');
                                initiateAutomation.innerHTML = "Iniciar Automação";
                                initiateAutomation.append(automationIcon);
                                Notiflix.Block.Remove('#container');
                                modalToggler.style.display= "table";
                                localStorage.isAutoStarted = false;
                                initiateAutomation.classList.remove("w3-red");
                                initiateAutomation.classList.add("w3-blue");
                            }else{
                                if((parseInt(JSON.parse(localStorage.getItem("currentItem")))) < JSON.parse(localStorage.getItem("itemStatus")).length){
                                    automationIcon.setAttribute('class','w3-margin-left fas fa-pause');
                                    initiateAutomation.innerHTML = "Pausar Automação";
                                    initiateAutomation.append(automationIcon);
                                    initiateAutomation.classList.remove("w3-blue");
                                    initiateAutomation.classList.add("w3-red");
                                    modalToggler.style.display= "none";
                                    localStorage.isAutoStarted = true;
                                    automationAction(JSON.parse(localStorage.getItem("isTypeSelected")) - 1);
                                }else{
                                    Notiflix.Report.Info(
                                        'Automação completa',
                                        'Todos os itens da automação já foram contemplados.',
                                        'Ok'
                                    );
                                }
                            }
                        },false);
                        initiateAutomation.append(automationIcon);
                        let resultIcon = document.createElement('i');
                        resultIcon.setAttribute('class','w3-margin-left fas fa-copy');
                        let resultCopy = document.createElement('div');
                        resultCopy.setAttribute('class','w3-btn w3-margin-bottom w3-indigo w3-padding w3-round');
                        resultCopy.style.float = "none";
                        resultCopy.style.margin = "auto";
                        resultCopy.innerHTML = "Copiar Nº's ticket";
                        resultCopy.append(resultIcon);
                        if((parseInt(JSON.parse(localStorage.getItem("currentItem")))) < JSON.parse(localStorage.getItem("itemStatus")).length){
                            initiateAutomation.style.display = "table";
                            resultCopy.style.display = "none";
                        }else{
                            initiateAutomation.style.display = "none";
                            resultCopy.style.display = "table";

                            let inputResult = document.createElement("textarea");
                            inputResult.style.position = "absolute";
                            inputResult.style.left = "0px";
                            inputResult.style.top = "0px";
                            inputResult.style.opacity = "0";
                            inputResult.style.height = "0px";
                            inputResult.style.width = "0px";
                            automateBtnWrapper.appendChild(inputResult);

                            resultCopy.addEventListener("click",()=>{
                                inputResult.value = JSON.parse(localStorage.getItem("itemStatus")).join('\n');
                                inputResult.select();
                                document.execCommand("copy");
                                resultCopy.innerText = "Copiado!";
                                setTimeout(()=>{
                                    resultCopy.innerHTML = "Copiar Nº's ticket";
                                    resultCopy.append(resultIcon);
                                },1000);
                            },false);
                        }
                        automateBtnWrapper.append(initiateAutomation);
                        automateBtnWrapper.append(resultCopy);
                        let tableDataWrapper = document.createElement('div');
                        tableDataWrapper.style.overflow = "auto";
                        tableDataWrapper.style.height = "90vh";
                        let tableData = document.createElement('table');
                        tableData.setAttribute('class','w3-table-all');
                        let tableDataHeader = document.createElement('thead');
                        let tableDataBody = document.createElement('tbody');
                        let tableDataTh = document.createElement('th');
                        let tableDataTr = document.createElement('tr');
                        let tableDataTrHead = document.createElement('tr');
                        tableDataTrHead.setAttribute('class','w3-blue');
                        let tableDataTd = document.createElement('td');
                        let topicHeaders = JSON.parse(localStorage.getItem("headers"));
                        topicHeaders[JSON.parse(localStorage.getItem("isTypeSelected")) - 1].unshift("Item");
                        topicHeaders[JSON.parse(localStorage.getItem("isTypeSelected")) - 1].forEach((elem,index)=>{
                            let th = tableDataTh.cloneNode(false);
                            th.innerText = elem;
                            th.setAttribute('class','w3-border')
                            tableDataTrHead.append(th);
                        });

                        tableDataWrapper.append(tableData);
                        tableData.append(tableDataHeader);
                        tableDataHeader.append(tableDataTrHead);
                        tableData.append(tableDataBody);

                        let topicItems = JSON.parse(localStorage.getItem("items"));
                        topicItems.forEach((elem,index)=>{
                            let currentTr = tableDataTr.cloneNode(false);
                            let tdText = elem.split(/\t/g);
                            tdText.unshift(index + 1);
                            tdText.forEach((el,idx)=>{
                                let td = tableDataTd.cloneNode(false);
                                td.style.minWidth = "300px";
                                td.innerText = el;
                                td.setAttribute('class','w3-border')
                                currentTr.append(td);
                            });
                            tableDataBody.append(currentTr);
                        });
                        rightWrapper.append(tableDataWrapper);
                        insertIcon.setAttribute('class','w3-margin-left fas fa-trash-alt');
                        insertData.setAttribute('class','w3-btn w3-section w3-margin-right w3-padding w3-red w3-round');
                        insertData.style.float = "right";
                        insertData.innerText = "Limpar Dados";
                        insertData.addEventListener('click',()=>{
                             Notiflix.Confirm.Show(
                                'Limpar dados',
                                'Deseja limpar os dados da tabela?',
                                'Sim',
                                'Não',
                                 ()=>{
                                localStorage.currentItem = 0;
                                localStorage.itemStatus = false;
                                localStorage.isAutoStarted = false;
                                localStorage.isTypeSelected = false;
                                localStorage.setItem("items",JSON.stringify([]));
                                window.location.reload();
                                },
                                 ()=>{}
                            );
                        },false);
                        insertData.append(insertIcon);
                        let onGoingWrapper = document.createElement('div');
                        onGoingWrapper.setAttribute('class','w3-col s12 w3-white');
                        onGoingWrapper.style.position = "absolute";
                        onGoingWrapper.style.width = "200px";
                        onGoingWrapper.style.padding = "8px";
                        onGoingWrapper.style.left = "0";
                        onGoingWrapper.style.bottom = "0";
                        onGoingWrapper.style.overflow = "auto";
                        onGoingWrapper.style.height = "80vh";
                        let tableOnGoing = document.createElement('table');
                        tableOnGoing.setAttribute('class','w3-table-all');
                        let onGoingHeaders = ["Item", "Nº do ticket"];
                        let onGoingTr = tableDataTr.cloneNode(false);
                        onGoingTr.setAttribute('class','w3-blue');
                        onGoingHeaders.forEach((elem,index)=>{
                            let th = tableDataTh.cloneNode(false);
                            th.innerText = elem;
                            th.setAttribute('class','w3-border')
                            onGoingTr.append(th);
                        });
                        let onGoingBody = document.createElement('tbody');
                        JSON.parse(localStorage.getItem("itemStatus")).forEach((elem,index)=>{
                            let currentTr = tableDataTr.cloneNode(false);
                            let td = tableDataTd.cloneNode(false);
                            td.setAttribute('class','w3-border');
                            td.innerText = (index + 1);
                            currentTr.append(td);
                            td = tableDataTd.cloneNode(false);
                            td.setAttribute('class','w3-border');
                            td.innerText = elem;
                            currentTr.append(td);
                            onGoingBody.append(currentTr);
                        });

                        tableOnGoing.append(onGoingTr);
                        tableOnGoing.append(onGoingBody);
                        onGoingWrapper.append(tableOnGoing);
                        leftMenu.append(onGoingWrapper);
                    }
                    rightWrapper.append(insertData);
                    sBODY.appendChild(modalWaiter);
                    sBODY.appendChild(leftMenu);
                    sBODY.appendChild(rightWrapper);
                    shadow.appendChild(sHTML);
                    sHTML.appendChild(sHEAD);
                    sHTML.appendChild(sBODY);
                }
            }
            customElements.define('user-ui', userUi);
            let userInterface = document.createElement('user-ui');
            userInterface.style.position = "relative";
            document.querySelector("body").appendChild(userInterface);
        } else {
            alert("Navegador incompatível. Por favor atualize o seu navegador.");
        }
    }

})();
