var triggerTabList = [].slice.call(document.querySelectorAll('#contact-list a'));
var triggerTabContent = [].slice.call(document.querySelectorAll('#contact-content .tab-pane'));
triggerTabList.forEach(function (triggerEl) {
    var tabTrigger = bootstrap.Tab.getOrCreateInstance(triggerEl);
    var tabContent = bootstrap.Tab.getInstance(document.querySelector('#contact-content .tab-pane' + triggerEl.getAttribute('href')));
    triggerEl.addEventListener('click', function (event) {
        event.preventDefault()
        tabTrigger.show()
        tabContent.show()
    })
})