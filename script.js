'use strict'

let $=document

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js";
import { getStorage,deleteObject , ref , uploadBytesResumable,getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCWpIN0tOB7zzwLjx8dTN80Zbay2VOicwo",
    authDomain: "phone-book-5f935.firebaseapp.com",
    databaseURL: "https://phone-book-5f935-default-rtdb.firebaseio.com",
    projectId: "phone-book-5f935",
    storageBucket: "phone-book-5f935.appspot.com",
    messagingSenderId: "21609013904",
    appId: "1:21609013904:web:eae90b028357dba81eae15",
    measurementId: "G-Y2JXBH99T6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const addContactModal=$.querySelector('.addContactModal')

const addContactBtn=$.querySelector('.addContactBtn')

const contactsList=$.querySelector('.contactsList')

const searchContactElm=$.querySelector('input')

let containerFlag = $.querySelector('.containerFlag')

let flag=true

const add_Contact_Btn_In_Modal=$.querySelector('.addContact')

const contactNameInput=$.querySelector('.contactName')

const contactEmailInput=$.querySelector('.contactEmail')

let uploadedImage=''

const contactNumberInput=$.querySelector('.contactNumber')

const contactsCon=$.querySelector('.contactCon')

let counter=0

let searchInput=$.querySelector('input')

const storage=getStorage()

class databaseConnection{
    post(contactInfo){

        fetch(`https://phone-book-5f935-default-rtdb.firebaseio.com/Contacts.json`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(contactInfo)
        })
    }
    async put(contactInfo){

        let data=await this.get()

        let contactFirebaseID=await this.findID(data,contactInfo.id)
        console.log('s')
        fetch(`https://phone-book-5f935-default-rtdb.firebaseio.com/Contacts/${contactFirebaseID}.json`,{
            method:'PUT',
            body:JSON.stringify(contactInfo)
        })
    }
    async  get(){

        let request=await fetch(`https://phone-book-5f935-default-rtdb.firebaseio.com/Contacts.json`)

        let response=await request.json()

        if(response!=null){
            let data=Array.from(Object.entries(response))

            return data
        }
    }
    async delete(target,imagePath){

        let contactID=target.parentElement.parentElement.parentElement.id

        target.parentElement.parentElement.parentElement.remove()

        let data=await this.get()

        let contactFirebaseID=await this.findID(data,contactID)

        fetch(`https://phone-book-5f935-default-rtdb.firebaseio.com/Contacts/${contactFirebaseID}.json`,{
            method:'DELETE'
        })


        if(!imagePath==='images/default/contact.png'){

            let imageRef=ref(storage,imagePath)

            await deleteObject(imageRef)
        }
    }

    findID(data,ID){
        if(data.length>0){
            let contactFirebaseID=''
            data.forEach(contact=>{
                if(contact[1].id==ID){
                    contactFirebaseID=contact[0]
                }
            })
            return contactFirebaseID
        }
    }
    async postInStorage(imageSelector,isEditing,ContactInfo,imageElement){

        let returningValue=[]

        const metaData={
                contentType:imageSelector.files[0].name
            }
            const imageRef=ref(storage,`images/${counter}/'${imageSelector.files[0].name}`)

            const uploadTask=uploadBytesResumable(imageRef,imageSelector.files[0],metaData)

             uploadTask.on('state-changed',(snapshot)=>{

                    let progress=(snapshot.bytesTransferred / snapshot.totalBytes) *100
                },
                (error)=>{
                    console.log(error)
                },
                async ()=>{
                    await getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL)=>{

                        if(isEditing){

                            ContactInfo.imagePath=imageRef._location.path

                            ContactInfo.imageSrc=downloadURL

                            this.put(ContactInfo)

                            imageElement.src=downloadURL
                        }else {
                            new contactInfo(contactNameInput.value,contactEmailInput.value,contactNumberInput.value,imageRef._location.path_,downloadURL)
                        }
                    })
                }
            );
    }
}

let counterGenerateFlag=0

let cameToGenerate=0

let isSelected=false

class helpFullFuncs extends databaseConnection{

    constructor() {
        super();

    }

    toggleClasses(){

        addContactModal.classList.remove('animate__backInDown')

        addContactModal.classList.add('animate__backOutDown')

        searchContactElm.classList.remove('blur-sm')

        setTimeout(()=>{
            addContactModal.classList.add('hidden')

            addContactModal.classList.remove('animate__backOutDown')

            addContactModal.classList.add('animate__backInDown')
        },800)

        contactsList.classList.remove('blur-sm')

    }
     async requiredEvents(){

        add_Contact_Btn_In_Modal.addEventListener('click',async()=>{

            const imageSelector=$.querySelector('.imageSelector')

            if(isSelected){
                await this.postInStorage(imageSelector)

                isSelected=false
            }else {

                let defaultImageRef=await ref(storage,'images/default/contact.png')

                let defaultImageURL=await getDownloadURL(defaultImageRef)

                new contactInfo(contactNameInput.value,contactEmailInput.value,contactNumberInput.value,'images/default/contact.png',defaultImageURL)
            }

            this.toggleClasses()
        })

        addContactBtn.addEventListener('click', async ()=>{

            flag=true

            const imageSelector=$.querySelector('.imageSelector')

            imageSelector.addEventListener('input',()=>isSelected=true)

            window.addEventListener('keyup',async (event)=>{
                if(containerFlag.classList.contains('hidden')===false){
                    if(addContactBtn.classList.contains('hidden')===false&&event.key==='Escape'){

                        this.toggleClasses()

                    }else if(addContactBtn.classList.contains('hidden')===false&&event.key==='Enter'&&flag){

                        await this.setPic(uploadedImage)

                        uploadedImage=''

                        this.toggleClasses()

                        flag=false
                    }
                }
            })

            addContactModal.classList.remove('hidden')

            contactsList.classList.add('blur-sm')

            searchContactElm.classList.add('blur-sm')

        })

        searchInput.addEventListener('input',()=>{

            Array.from(contactsCon.children).forEach(child=>{
                child.classList.add('hidden')
            })

            let names=$.querySelectorAll('.nameCase')

            names.forEach(name=>{

                if(name.innerHTML.startsWith(event.target.value)){

                    name.parentElement.parentElement.parentElement.parentElement.classList.remove('hidden')
                }
            })

            searchInput.addEventListener('blur',()=>{
                Array.from(contactsCon.children).forEach(child=>{
                    child.classList.remove('hidden')
                })
            })
        })
    }
    async setPic(uploadedImagePath){

        new contactInfo(contactNameInput.value,contactEmailInput.value,contactNumberInput.value,uploadedImagePath)
    }
}

new helpFullFuncs().requiredEvents()

let editFlag=true

class editContact extends databaseConnection{

    setEvent(contactInfo){
        let editSigns=$.querySelectorAll('.editSigns')

        editSigns.forEach(editSign=>{
            editSign.addEventListener('click',()=>{
                this.putTemplate(event.target,contactInfo)
            })
        })
    }
    putTemplate(target,contactInfo) {

        editFlag = true

        let prevTemplate = target.parentElement.parentElement.parentElement

        if (prevTemplate.classList.contains('notFirstTime') === false) {

            if (target.id === 'name') {
                prevTemplate.insertAdjacentHTML('beforeend', `<div class="flex inputContainer w-64 relative right-4 bottom-6"><input type="text" inputId="${event.target.id}"  class=" w-10/12  mt-8 h-16 flex text-3xl outline-none editInput rounded-md"  style="border: 1px solid #ccc;width: 10rem;padding-left: .7rem" value=""/><button style="background:#0066ff;" class="w-24 h-10 mt-12 ml-6 text-white rounded-full changeBtn">change</button></div>`)
            } else {
                prevTemplate.insertAdjacentHTML('beforeend', `<div class="flex inputContainer w-full relative right-4 bottom-6"><input type="text" inputId="${event.target.id}"  class=" w-10/12  mt-8 h-16 flex pl-12 text-3xl outline-none editInput ml-3 rounded-md"  style="border: 1px solid #ccc;margin-left: 2.5rem" value=""/><button style="background:#0066ff;" class="w-24 h-10 mt-12 ml-6 text-white rounded-full changeBtn">change</button></div>`)
            }
            prevTemplate.classList.add('notFirstTime')
        } else {
            prevTemplate.children[1].classList.remove('hidden')
        }
        prevTemplate.children[0].classList.add('hidden')

        let editInputs = $.querySelectorAll('.editInput')

        editInputs.forEach(editInput => {
            editInput.addEventListener('keyup', () => {

                if (event.key === 'Enter') {

                    this.editValue(event.target, contactInfo)

                    this.hideInputs(prevTemplate, event.target)
                }
            })

            editInputs.forEach(editInput => {

                editInput.addEventListener('blur', () => {

                    let changeValueBtn = event.target.parentElement.children[1]

                    if (event.relatedTarget === changeValueBtn) {
                        this.editValue(event.target, contactInfo)

                        this.hideInputs(prevTemplate, event.target)
                    } else {
                        this.hideInputs(prevTemplate, event.target)
                    }
                })
            })

        })
    }
    editValue(input,contactInfo){

        if(editFlag){

            let valueKeeper=$.querySelectorAll(`.${input.getAttribute('inputId')}`)[0]

            editFlag=false

            if(valueKeeper.classList.contains('number')){

                let inputValue=input.value.split('')

                let newValue=''

                inputValue.forEach(num=>{
                    if((num.trim()==='')===false){
                        newValue+=num
                    }
                })

                let valueParts=[newValue.slice(0, 4),newValue.slice(4, 7),newValue.slice(7, 11)]

                let valueKeeperChildren=Array.from(valueKeeper.children)

                valueKeeperChildren.forEach((child,index)=>{
                    if(index!=3){
                        child.innerHTML=valueParts[index]
                    }
                })
            }else {

                valueKeeper.innerHTML=input.value
            }
        contactInfo[input.getAttribute('inputID')]=input.value

        this.put(contactInfo)

        input.value=''
        }
    }
    hideInputs(prevTemplate,target){

        prevTemplate.children[0].classList.remove('hidden')

        target.value=''

        prevTemplate.children[1].classList.add('hidden')

    }
}

class showContactInfo extends editContact{
    constructor(Contacts,imagePath) {
        super()
        Contacts.forEach(Contact=>{

            Contact.addEventListener('click',()=>{

                let ContactInfo={
                    id:Contact.id,
                    name:Contact.children[0].children[0].children[0].children[1].innerHTML,
                    email:Contact.children[0].children[0].children[0].children[2].innerHTML,
                    number:Contact.children[0].children[0].children[0].children[3].innerHTML,
                    imageSrc:Contact.children[0].children[0].children[0].children[0].children[0].src,
                    imagePath
                }
                event.stopPropagation()

                cameToGenerate++

                this.generateValidation(ContactInfo,Contact)
            })

        })
    }
    generateValidation(ContactInfo,Contact) {

        if(counterGenerateFlag===0){
            cameToGenerate=0

            this.showInfo(ContactInfo)

            counterGenerateFlag++
        }else {
            let childIndex=0

            Array.from(Contact.parentElement.children).forEach((child,index)=>{
                if(child===Contact){
                    index+=1
                    childIndex=index
                }
            })
            if(Contact===Contact.parentElement.lastChild){

                counterGenerateFlag=0

                this.showInfo(ContactInfo)

            }else if((Contact.parentElement.children.length-childIndex)===cameToGenerate){

                counterGenerateFlag=0
            }

        }


    }

    async showInfo(Contact) {

        searchInput.value=''

        searchInput.classList.add('hidden')

        let container = $.querySelector('.container')

        containerFlag.classList.add('hidden')

        container.insertAdjacentHTML('beforeend', `<div class="contactInfoContainer"><img src="./icon/return.png" class="w-8 h-8 absolute cursor-pointer returnToMain" style="left: 29rem;top: 14rem">
<div class="w-full h-72 flex justify-center items-center mt-8 ">    
            <div class="w-36 h-36 rounded-full border border-solid relative bottom-12">
                <img src="${Contact.imageSrc}" class="rounded-full w-40 h-36  image">
<div class="round absolute inset-0 h-8 w-8 text-center rounded-full overflow-hidden  flex items-center justify-center cursor-pointer" style="background: #0066ff">
        <input type="file" class="absolute opacity-0 scale-150 imageSelector" accept="image/*">
        <img src="./icon/camera.png" class="w-4">
      </div>
                <div>
                <div>
                                <div class="w-full flex justify-center items-center relative right-1">
                         <p class="w-full text-center text-3xl mt-4 ml-12 name">${Contact.name}</p>
                         <img src="icon/edit.png" class="w-8 h-8 cursor-pointer relative left-4 top-2 editSigns" id="name">
                </div>
                </div>
                </div>        
            </div>
        </div>
            <div class="overflow-y-auto h-72">
                <div>
                    <div class="w-full">
                        <div class="h-24 w-full flex items-center cursor-pointer border-b border-solid">
                            <div class="w-1/2 text-xl pl-12 pt-2">
                                <div class="flex  flex-col">
                                    <div class="flex number"><p>${Contact.number.slice(0, 4)}</p>&nbsp;<p>${Contact.number.slice(4, 7)}</p>&nbsp;<p>${Contact.number.slice(7, 12)}<p></div>
                                    <p class="text-lg opacity-60">mobile</p>
                                </div>
                            </div>
                            <div class="flex w-1/2 items-center justify-end pr-12">
                                <img src="icon/edit.png" class="w-8 h-8 cursor-pointer mr-12 editSigns" id="number">
                                <img src="icon/call.png" class="w-8 h-8 cursor-pointer mr-12">
                                <img src="./icon/message.png" class="w-8 h-8 cursor-pointer">
                            </div>
                        </div>
                    </div>
                </div>            
                    <div>
                    <div class="w-full">
                        <div class="h-24 w-full flex items-center cursor-pointer border-b border-solid ">
                            <div class="w-1/2 text-xl pl-12 pt-2">
                                <div class="flex  flex-col">
                                    <div class="flex email">${Contact.email}</div>
                                    <p class="text-lg opacity-60">email</p>
                                </div>
                            </div>
                            <div class="flex w-1/2 items-center justify-end pr-12">
                                <img src="icon/edit.png" class="w-8 h-8 cursor-pointer mr-12 editSigns" id="email">
                                <img src="icon/call.png" class="w-8 h-8 cursor-pointer mr-12">
                                <img src="./icon/message.png" class="w-8 h-8 cursor-pointer">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="w-full">
                        <div class="h-24 w-full flex items-center cursor-pointer border-b border-solid ">
                            <div class="w-1/2 text-xl pl-12 pt-2">
                                <div class="flex items-center">
                                    <div class="w-16 h-16 flex justify-center items-center mr-12 rounded-full  cursor-pointer" style="">
                                        <img src='./icon/whatsapp.png' class="rounded-full">
                                    </div>
                                    <p class="mb-2 cursor-text"></p>
                                </div>
                            </div>
                            <div class="flex w-1/2 items-center justify-end pr-12">
                                <img src="icon/call.png" class="w-8 h-8 cursor-pointer mr-12">
                                <img src="./icon/message.png" class="w-8 h-8 cursor-pointer">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="w-full">
                        <div class="h-24 w-full flex items-center cursor-pointer">
                            <div class="w-1/2 text-xl pl-12 pt-2">
                                <div class="flex items-center">
                                    <div class="w-16 h-16 flex justify-center items-center mr-12 rounded-full border border-solid cursor-pointer" style="">
                                        <img src='./icon/telegram.png' class="rounded-full">
                                    </div>
                                    <p class="mb-2 cursor-text"></p>
                                </div>
                            </div>
                            <div class="flex w-1/2 items-center justify-end pr-12">
                                <img src="icon/call.png" class="w-8 h-8 cursor-pointer mr-12">
                                <img src="./icon/message.png" class="w-8 h-8 cursor-pointer">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
</div>
</div>
</div>`)
        let contactInfoContainer = $.querySelector('.contactInfoContainer')

        let nameEditorInput=$.querySelector('.name')

        let emailEditorInput=$.querySelector('.email')

        let numberEditorInput=$.querySelector('.number')

        let imageEditorInput=$.querySelector('.image')

        let contactInfo={
            id:Contact.id,
            name:Contact.name,
            email:Contact.email,
            number:Contact.number,
            imageSrc:Contact.imageSrc
        }
        const imageSelector=$.querySelector('.imageSelector')

        imageSelector.addEventListener('input',async ()=>{

            let newContact={
                id:Contact.id,
                name:nameEditorInput.textContent,
                email:emailEditorInput.textContent,
                number:numberEditorInput.textContent,
                imageSrc:imageEditorInput.src
            }

            this.postInStorage(imageSelector,true,newContact,imageEditorInput)

        })
        this.setEvent(contactInfo)

        let returnToMain = $.querySelector('.returnToMain')

        returnToMain.addEventListener('click', async () => {

            let newContact={
                id:Contact.id,
                name:nameEditorInput.textContent,
                email:emailEditorInput.textContent,
                number:numberEditorInput.textContent,
                imageSrc:imageEditorInput.src
            }

            searchInput.classList.remove('hidden')

            this.replaceInfo(newContact)

            containerFlag.classList.remove('hidden')

            contactInfoContainer.remove()
        })
    }
    replaceInfo(Contact){
        let mainNumber=''
        Contact.number.split('').forEach(num=>{
            if((num.trim()==='')===false){
                mainNumber+=num
            }
        })
        Array.from(contactsCon.children).forEach(child=>{

            if(child.id===Contact.id){
                child.children[0].children[0].children[0].children[1].innerHTML=Contact.name
                child.children[0].children[0].children[0].children[2].innerHTML=Contact.email
                child.children[0].children[0].children[0].children[3].innerHTML=mainNumber
                child.children[0].children[0].children[0].children[0].children[0].src=Contact.imageSrc
            }
        })


    }
}
class  addContact extends databaseConnection{
    constructor(newContact,postFlag) {
        super()

        contactsCon.insertAdjacentHTML('beforeend',`<div class="w-full contact" id="${newContact.id}">
                <div class="h-24 w-full flex items-center cursor-pointer border-b border-solid ">
                    <div class="w-1/2 text-xl pl-12 pt-2">
                        <div class="flex items-center">
                            <div class="w-16 h-16 flex justify-center items-center mr-12 rounded-full border border-solid cursor-pointer" style="">
                                <img src="${newContact.imageSrc}" class="w-16 h-16 rounded-full contactPic">
                            </div>
                            <p class="mb-2 cursor-text nameCase">${newContact.name}</p>
                            <p class="mb-2 cursor-text hidden emailCase">${newContact.email}</p>
                            <p class="mb-2 cursor-text hidden numberCase">${newContact.number}</p>
                        </div>
                    </div>
                    <div class="flex w-1/2 items-center justify-end pr-12">
                        <img src="icon/trash.png" class="w-8 h-8 cursor-pointer mr-12 trash">
                        <img src="icon/call.png" class="w-8 h-8 cursor-pointer mr-12">
                        <img src="./icon/message.png" class="w-8 h-8 cursor-pointer">
                    </div>
                </div>
            </div>`)

        const Contacts=$.querySelectorAll('.contact')

        new showContactInfo(Contacts,newContact.imagePath)

        let trashSigns=$.querySelectorAll('.trash')

        trashSigns.forEach(trashSign=>{
            trashSign.addEventListener('click',()=>{

                event.stopPropagation()

                this.delete(event.target,newContact.imagePath)
            })
        })

        let contactInfo={
            id:counter,
            name:newContact.name,
            email:newContact.email,
            number:newContact.number,
            imageSrc:newContact.imageSrc,
            imagePath:newContact.imagePath
        }

        if(postFlag===undefined) {
            this.post(contactInfo)
        }

    }

}


class contactInfo extends addContact{
    constructor(name,email,number,imagePath,imageSrc) {

        let ContactInfo = {
            id:counter,
            name,
            email,
            number,
            imagePath,
            imageSrc
        }

        searchInput.value=''

        super(ContactInfo)
        counter++
    }

}

class setContactsForStart extends databaseConnection{
    constructor () {
        super()

        this.set()
    }
    async set(){

        let data=await this.get()

        if(data!=null){
            data.forEach((contact)=>{

                new addContact(contact[1],true)

                counter++
            })
        }
    }
}

new setContactsForStart()