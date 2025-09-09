
/* --- --- --- requete /search --- --- --- */

$(document).ready(function () {
    var debounceTimeout;
    $('.search-username').on('input', function () {
        var name = $(this).val();
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(function () {
            loadFileContent(name);
        }, 300);
    });

    function loadFileContent(name) {
        if (!name.trim()) {
            $('.list-search').hide().html('');
            return;
        }

        var txtFileUrl = '/search?name=' + name;
        $.ajax({
            url: txtFileUrl,
            success: function (data) {
                let isValidHTML = true;

                try {
                    $(data);
                    if (isValidHTML) {
                        updateSearchResults(data);
                    } else {
                        console.error('Le contenu du fichier n\'est pas du HTML valide');
                    }
                } catch (e) {
                    isValidHTML = false;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        });
    }

    function updateSearchResults(newContent) {
        var tempDiv = $('<div>').html(newContent);
        var searchContent = tempDiv.find('.list-search');
        var listConversation = $('.list-conversation');

        if (searchContent.length > 0) {
            $('.list-search').html(searchContent.html());
            $('.list-search').show();
        } else {
            console.error('Aucun élément .list-search trouvé dans newContent');
            $('.list-search').hide();
        }
    }
});


/* --- --- --- requete /show-conversation --- --- --- */
// $('.user-conversations, .search-item').click(function() {
//     var uniqueId = $(this).data('unique-id');
//     window.location.href = `/conversation?uniqueId=${uniqueId}`;
// });
// window.addEventListener('beforeunload', function(event) {
//     let url = new URL(window.location.href);
//     url.search = '';
//     window.history.replaceState({}, document.title, url);
// });

$(document).on('click', '.user-conversations', async function(e) {
    e.preventDefault();
    var uniqueId = $(this).data('unique-id');
    var url = `/show-conversation/${uniqueId}`;

    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            // console.log(data);
            $('body').html($(data));
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});

/* */

/* */

$(document).on('click', '.btn-send', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    var uniqueId = $(this).data('unique-id');
    var InputMessage = $('.input-message');
    var token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    var url = `/new-message/${uniqueId}`;

    console.log(uniqueId, InputMessage.val(), url);
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            token: token,
            uniqueId: uniqueId,
            message: InputMessage.val()
        },
        success: function(e) {
            InputMessage.val('');
            console.log('Data : ', e);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});
