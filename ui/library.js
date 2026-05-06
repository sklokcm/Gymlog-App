import { ExerciseLibrary } from "gymlog-core";

const libraryCardContainer = document.getElementById('library-cards-container');
const saveNewExBtn = document.getElementById('save-new-ex-btn');

function getEmbedUrl(url){
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
}

export function renderLibrary(){
    const exercises = ExerciseLibrary.getExercises();
    libraryCardContainer.innerHTML='';
    exercises.slice().reverse().forEach(ex=>{
        const card = document.createElement('div');
        card.style.cssText="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;";

        const url = getEmbedUrl(ex.video);
        let videoHTML = '';
        if (url) {
            videoHTML = `
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
            <iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
            </div>`;
        }

        card.innerHTML = `
            ${videoHTML}
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 1.2rem; color: #2c3e50;">${ex.name}</h3>
                <button class="delete-library-ex-btn" data-id="${ex.id}" style="background: none; border: none; color: #dc3545; font-size: 1.2rem; cursor: pointer;">Delete</button>
            </div>
            <p style="margin: 0; font-size: 0.95rem; color: #6c757d; line-height: 1.4;">${ex.description}</p>
        `;

        libraryCardContainer.appendChild(card);
    });
}

const nameInput = document.getElementById('new-ex-name');
const descInput = document.getElementById('new-ex-desc');
const videoInput = document.getElementById('new-ex-video');

export function addExerciseToLibrary(){
    saveNewExBtn.addEventListener('click', ()=>{
        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const video = videoInput.value.trim();
        if (!name) {
        alert("Input exersice name!!!");
        return;
        }   
        ExerciseLibrary.saveNewExercise(name, desc, video);
        nameInput.value="";
        descInput.value="";
        videoInput.value="";

        renderLibrary();   
        RenderSearchList();});
}

export function deleteExerciseFromLibrary(){
    libraryCardContainer.addEventListener('click', (e)=>{
        if(e.target.classList.contains('delete-library-ex-btn')){
            const exId = e.target.getAttribute('data-id');
            if (confirm("Delete this exercise?")) {
                ExerciseLibrary.deleteExercise(exId);
                renderLibrary();
                RenderSearchList();
            }
        }
});
}