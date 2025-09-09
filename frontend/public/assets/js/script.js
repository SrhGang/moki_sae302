let textAnimated = document.querySelectorAll('.text-animated');
for(let i = 0; i < textAnimated.length; i++){
    textAnimated[i].innerHTML = textAnimated[i].textContent.replace(/\S/g, "<span class='letter'>$&</span>");
}
let spans = document.querySelectorAll('.text-animated');
for(let i = 0; i < spans.length; i++){
    let letters = spans[i].querySelectorAll('.letter');
    for(let j = 0; j < letters.length; j++){
        letters[j].style.animationDelay = `${j * 0.01}s`;
    }
}
let descpTextAnimation = document.querySelectorAll('.descp-text-animation');
let i = 0;
setInterval(function() {
    for(let j = 0; j < descpTextAnimation.length; j++){
        descpTextAnimation[j].classList.remove('text-animation-active');
    }
    descpTextAnimation[i].classList.add('text-animation-active');
    i = (i + 1) % descpTextAnimation.length;
}, 8000);