var triggerTabList = [].slice.call(document.querySelectorAll('#contact-list a'));
var triggerTabContent = [].slice.call(document.querySelectorAll('#contact-content .tab-pane'));
triggerTabList.forEach(function (triggerEl) {
    var tabTrigger = bootstrap.Tab.getOrCreateInstance(triggerEl);
    // var tabContent = bootstrap.Tab.getInstance(document.querySelector('#contact-content .tab-pane' + triggerEl.getAttribute('href')));
    triggerEl.addEventListener('click', function (event) {
        event.preventDefault()
        tabTrigger.show()
        // console.log(triggerEl.getAttribute('href'));

        if(triggerEl.getAttribute('href') == '#symon') {
            $('#photo').attr('src', '/images/contact images/symon.JPG')
        } else if(triggerEl.getAttribute('href') == '#riley') {
            $('#photo').attr('src', '/images/contact images/riley.JPG')
        } else if(triggerEl.getAttribute('href') == '#kyla') {
            $('#photo').attr('src', '/images/contact images/kyla.JPG')
        } else if(triggerEl.getAttribute('href') == '#dixon') {
            $('#photo').attr('src', '/images/contact images/dixon.JPG')
        } else if(triggerEl.getAttribute('href') == '#brad') {
            $('#photo').attr('src', '/images/contact images/brad.JPG')
        } 
    })
})