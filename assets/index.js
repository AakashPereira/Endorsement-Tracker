import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-2f1bd-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

const commentInputEl = document.getElementById("comment-field")
const fromInputEl = document.getElementById("from-field")
const toInputEl = document.getElementById("to-field")

const errorMsg = document.getElementById("error-msg")

const publishBtn = document.getElementById("publish-btn")

const containerEl = document.getElementById("container")

publishBtn.addEventListener("click", function() {
    if((commentInputEl.value).length == 0 || (fromInputEl.value).length == 0 || (toInputEl.value).length == 0) {
        errorMsg.textContent = "⚠️ Make sure to fill in all required fields";
        errorMsg.style.display = "block"
    } else {
        errorMsg.style.display = "none"
        let endorsement = {
            from: fromInputEl.value,
            to: toInputEl.value,
            comment: commentInputEl.value,
            likes: 0
        }
        push(endorsementsInDB, endorsement)
        fromInputEl.value = toInputEl.value = commentInputEl.value = ""
    }
})

onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        let endorsementsArray = Object.entries(snapshot.val())
        clearList()
        for (let i = 0; i < endorsementsArray.length; i++) {
            let endorsementID = endorsementsArray[i][0];
            let endorsementContent = endorsementsArray[i][1]
            let cardHTML = `<div class="card">
            <p class="bold">To ${endorsementContent.to}</p>
            <p>${endorsementContent.comment}</p>
            <div class="card-footer bold" id="${endorsementID}">
                <span>From ${endorsementContent.from}</span>
            </div>
            </div>`
            containerEl.insertAdjacentHTML('afterbegin',cardHTML)
            let cardFooter = document.getElementById(endorsementID)
            const likeBtn = document.createElement("span")
            if (!localStorage.getItem(endorsementID)) {
                likeBtn.textContent = `❤️ ${endorsementContent.likes}`
            } else {
                likeBtn.textContent = `🖤 ${endorsementContent.likes}`
            }
            likeBtn.classList.add("btn")
            likeBtn.addEventListener("click", function() {
                if (localStorage.getItem(endorsementID)) {
                    alert("You've already liked this comment")
                } else {
                    const commentRef = ref(database, `endorsements/${endorsementID}`)
                    update(commentRef, {likes: endorsementContent.likes + 1})
                    localStorage.setItem(endorsementID, true)
                }
            })
            cardFooter.append(likeBtn)
        }
    } else {
        console.log("Empty")
    }
})

function clearList() {
    containerEl.innerHTML = ""
}