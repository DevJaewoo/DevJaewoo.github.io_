var systemDB;

$(document).ready(function () {
    initDatabase();

    // 홈으로 이동
    $(".menu .home").on("click", function() {
        resetPost();
        selectForeground(".post-list");
    });

    // 새 글 작성
    $(".menu .new").on("click", function() {
        loadPostNew()
    });

    // 테이블 삭제
    $(".menu .drop").on("click", function () {

        if (!confirm("테이블을 삭제하겠습니까?")) {
            return;
        }

        dropTable();
    });

    // 글 이동
    $("body").on("click", ".post .title", function() {
        var no = $(this).parent().data("no");
        var idx = $(this).parent().data("idx");

        $(".post-view .num").html("번호: " + (Number(no) + 1));
        $(".post-view").data("idx", idx);
        loadPostView();
    });

    // 글 작성 확인
    $(".post-new-submit").on("click", function() {
        
        var postIdx = $(".post-new").data("idx");
        var username = $('#post-new-name').val(); 
        var title = $('#post-new-title').val();
        var content = $('#post-new-content').val();

        if (username == "" || title == "" || content == "") {
            alert("글을 적어주세요.");
            return;
        }

        if(Number(postIdx) == -1) {
            insertPost(username, title, content);
        }
        else {
            updatePost(username, title, content, postIdx);
        }

        resetPost();
        selectForeground(".post-list");
    });

    // 댓글 작성 확인
    $(".comment-write .submit").on("click", function() {
        var postIdx = $(".post-view").data("idx");
        var commentIdx = $(".comment-write").data("idx");
        var username = $('#post-comment-name').val(); 
        var content = $('#post-comment-content').val();

        if (username == "" || content == "") {
            alert("댓글을 적어주세요.");
            return;
        }

        if(Number(commentIdx) == -1) {
            insertComment(username, content, postIdx);
        }
        else {
            updateComment(username, content, commentIdx);
        }

        resetComment();
    });

    // 글 작성 취소
    $(".post-new-cancel").on("click", function() {
        resetPost();
        selectForeground(".post-list");
    });

    // 댓글 작성 취소
    $(".comment-write .cancel").on("click", function() {
        resetComment();
    });
    
    // 글 수정
    $("body").on("click", ".post .edit", function() {
        var idx = $(this).parent().parent().data("idx");

        $(".post-new").data("idx", idx);
        loadPostEdit();
    });

    // 댓글 수정
    $("body").on("click", ".comment .edit", function() {
        var idx = $(this).parent().parent().data("idx");

        $(".comment-write").data("idx", idx);
        loadCommentEdit();
    });

    // 글 삭제
    $("body").on("click", ".post .delete", function() {
        
        var idx = $(this).parent().parent().data("idx");

        if (Number(idx) <= 0) {
            alert("삭제할 글을 선택해주세요.");
            return;
        }    

        if (!confirm("삭제하겠습니까?")) {
            return;    
        }

        deletePost(idx);
    });

    // 댓글 삭제
    $("body").on("click", ".comment .delete", function() {
        
        var idx = $(this).parent().parent().data("idx");

        if (Number(idx) <= 0) {
            alert("삭제할 글을 선택해주세요.");
            return;
        }    

        if (!confirm("삭제하겠습니까?")) {
            return;    
        }

        deleteComment(idx);
    });
});

//DB 초기화
function initDatabase() {
    if (!window.openDatabase) {
        alert("현재 브라우저는 Web SQL Database를 지원하지 않습니다");
    }
    else {
        var shortName = "Feedback";
        var version = "1.0";
        var displayName = "Feedback";
        var maxSize = 1024 * 128; // in bytes
        systemDB = openDatabase(shortName, version, displayName, maxSize);
    }

    createTable();
    selectPostList();
}

//테이블 생성
function createTable() {

    //게시글 테이블
    var strCreatePost = "CREATE TABLE IF NOT EXISTS tb_post"
        + " (idx INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"
        + " username TEXT NOT NULL,"
        + " title TEXT NOT NULL,"
        + " content TEXT NOT NULL,"
        + " regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";

    //댓글 테이블
    var strCreateComment = "CREATE TABLE IF NOT EXISTS tb_comment"
        + " (idx INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"
        + " username TEXT NOT NULL,"
        + " content TEXT NOT NULL,"
        + " postid INTEGER NOT NULL,"
        + " regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";

    systemDB.transaction(function (tx) {
        tx.executeSql(strCreatePost, [], null, errorHandler);
        tx.executeSql(strCreateComment, [], null, errorHandler);
    });
}

// 테이블 삭제
function dropTable() {

    systemDB.transaction(function (tx) {
        tx.executeSql("DROP TABLE tb_post", [], refreshPost, errorHandler);
        tx.executeSql("DROP TABLE tb_comment", [], refreshPost, errorHandler);
    });

    resetPost(); 
    initDatabase();
}

//게시글 작성
function insertPost(username, title, content) {
    var query = "INSERT INTO tb_post (username, title, content) VALUES (?, ?, ?)";

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [username, title, content], refreshPost, errorHandler);
    });
}

//댓글 작성
function insertComment(username, content, postid) {
    var query = "INSERT INTO tb_comment (username, content, postid) VALUES (?, ?, ?)";

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [username, content, postid], refreshComment, errorHandler);
    });
}

//게시글 수정
function updatePost(username, title, content, idx) {
    var query = "UPDATE tb_post SET username = ?, title = ?, content = ? WHERE idx = ?";

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [username, title, content, idx], refreshPost, errorHandler);
    });
}

//댓글 수정
function updateComment(username, content, idx) {
    var query = "UPDATE tb_comment SET username = ?, content = ? WHERE idx = ?";

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [username, content, idx], refreshComment, errorHandler);
    });
}

//게시글 삭제
function deletePost(idx) {

    var query = "DELETE FROM tb_comment WHERE postid=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], refreshPost, errorHandler);
    });

    var query = "DELETE FROM tb_post WHERE idx=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], refreshPost, errorHandler);
    });
}

//댓글 삭제
function deleteComment(idx) {
    var query = "DELETE FROM tb_comment WHERE idx=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], refreshComment, errorHandler);
    });
}

//게시글 조회
function selectPostList() {
    var query = "SELECT * FROM tb_post order by idx desc";
    $(".post-read").html('');

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [], function (tx, result) {
            dataset = result.rows;
            var str = '';

            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) {
                    item = dataset.item(i);
                    str += '<div class="flex row post" data-no="' + i + '" data-idx="' + item['idx'] + '">\n'
                        + '<span class="num">' + (i + 1) + '</span>\n'
                        + '<span class="title">' + item['title'] + '</span>\n'
                        + '<span class="user">' + item['username'] + '</span>\n'
                        + '<span class="date">' + item['regdate'] + '</span>\n'
                        + '<div class="control">\n'
                        + '<span class="button edit">수정</span>\n'
                        + '<span class="button delete">삭제</span>\n'
                        + '</div>\n'
                        + '</div>';
                }
            }
            else {
                str += "작성된 글이 없습니다.";
            }

            $(".post-read").html(str);
        });
    });
}

function selectCommentList() {
    var query = "SELECT * FROM tb_comment WHERE postid=? order by idx asc";
    var idx = $(".post-view").data("idx");

    $(".comment-read").html('');

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], function (tx, result) {
            dataset = result.rows;
            var str = '';

            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) {
                    item = dataset.item(i);
                    str += '<div class="flex row comment" data-no="' + i + '" data-idx="' + item['idx'] + '">\n'
                    + '<span class="user">' + item['username'] + '</span>\n'
                    + '<span class="content">' + item['content'] + '</span>\n'
                    + '<span class="date">' + item['regdate'] + '</span>\n'
                    + '<div class="control">\n'
                    + '<span class="button edit">수정</span>\n'
                    + '<span class="button delete">삭제</span>\n'
                    + '</div>\n'
                    + '</div>\n';
                }
            }
            else {
                str += "작성된 댓글이 없습니다.";
            }

            $(".comment-read").html(str);
        });
    });
}

function loadPostNew() {
    resetPost();
    $(".post-new").data("idx", "-1");
    selectForeground(".post-new");
}

function loadPostEdit() {
    var query = "SELECT * FROM tb_post WHERE idx=?";
    var idx = $(".post-new").data("idx");

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], function (tx, result) {
            var item = result.rows.item(0);
            $("#post-new-title").val((item['title']).toString());
            $("#post-new-name").val((item['username']).toString());
            $("#post-new-content").val((item['content']).toString());

            selectForeground(".post-new");
        });
    });
}

function loadCommentEdit() {
    var query = "SELECT * FROM tb_comment WHERE idx=?";
    var idx = $(".comment-write").data("idx");

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], function (tx, result) {
            var item = result.rows.item(0);
            $("#post-comment-name").val((item['username']).toString());
            $("#post-comment-content").val((item['content']).toString());
        });
    });
}

function loadPostView() {
    var query = "SELECT * FROM tb_post WHERE idx=?";
    var idx = $(".post-view").data("idx");

    console.log("idx: " + idx);

    systemDB.transaction(function (tx) {
        tx.executeSql(query, [Number(idx)], function (tx, result) {
            var item = result.rows.item(0);

            $(".post-view-main .title").html(item['title']);
            $(".post-view-main .user").html("작성자:" + item['username']);
            $(".post-view-main .date").html(item['regdate']);
            $(".post-view-main .content").html(item['content']);
        });
    });

    resetComment();
    selectCommentList();
    selectForeground(".post-view");
}


function refreshPost() {
    resetPost();
    selectPostList();
}

function refreshComment() {
    resetComment();
    selectCommentList();
}

function resetPost() {
    $("#post-new-title").val("");
    $("#post-new-name").val("");
    $("#post-new-content").val("");
}

function resetComment() {
    $("#post-comment-name").val("");
    $("#post-comment-content").val("");
    $(".comment-write").data("idx", "-1");
}

//.post-new .post-list .post-view
function selectForeground(section) {
    $(".mainpage .active").removeClass("active");
    $(section).addClass("active");
}

function errorHandler(transaction, error) {
    console.error(error + 'Error: ' + error.message + ' (Code ' + error.code + ')');
}