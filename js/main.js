//top-visual fade-in 효과
const fadeEl = document.querySelectorAll('.top_visual .snow')
fadeEl.forEach(function(fadeEl,index) {
    gsap.to(fadeEl,1,{
        delay:(index+1)*.3,
        opacity:1
    })
})

//starbucks promotion
const promotionEl = document.querySelector('.tea-recipe')
const promotionToggleBtn = document.querySelector('.toggle-tea')
let isHidePromotion = false
promotionToggleBtn.addEventListener('click',function() {
    isHidePromotion = !isHidePromotion
    if(isHidePromotion) {
        //숨김
        promotionEl.classList.add('hide')
    } else {
        //보임
        promotionEl.classList.remove('hide')
    }
})