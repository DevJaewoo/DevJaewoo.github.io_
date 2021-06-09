var systemDB;
var dataset;
var postId = -1;
var commentId = -1;

$(document).ready(function () {
    initDatabase();

    $(".test").on("click", function() {

        insertTestDB();
        selectCommentList(7);
    });


    // 홈으로 이동
    $(".menu .home").on("click", function() {
        resetPost();
        selectForeground(".post-list");
    });

    // 새 글 작성
    $(".menu .new").on("click", function() {
        postId = -1;
        selectForeground(".post-new")
    });

    // 테이블 삭제
    $(".menu .drop").on("click", function () {

        if (!confirm("테이블을 삭제하겠습니까?")) {
            return;
        }

        dropTable();
    });

    $(".post .title")

    // 글 작성 확인
    $(".post-new-submit").on("click", function() {
        
        var username = $('#post-new-name').val(); 
        var title = $('#post-new-title').val();
        var content = $('#post-new-content').val();

        if (username == "" || title == "" || content == "") {
            alert("글을 적어주세요.");
            return;
        }

        if(postId == -1) {
            insertPost(username, title, content);
        }
        else {
            updatePost(username, title, content, postId);
        }

        postId = -1;

        resetPost();
        selectForeground(".post-list");
    });

    // 댓글 작성 확인
    $(".post-new-submit").on("click", function() {
        
        var username = $('#post-new-name').val(); 
        var content = $('#post-new-content').val();

        if (username == "" || content == "") {
            alert("댓글을 적어주세요.");
            return;
        }

        if(commentId == -1) {
            insertComment(username, content, postId);
        }
        else {
            updateComment(username, content, commentId);
        }

        commentId = -1;

        resetPost();
        selectForeground(".post-list");
    });

    // 글 작성 취소
    $(".post-new-cancel").on("click", function() {
        resetPost();
        selectForeground(".post-list");
    });

    
    // 글 수정
    $("body").on("click", ".post .edit", function() {
        var no = $(this).data("no");
        var idx = $(this).data("idx");

        postId = idx;
        loadRecord(no);
        selectForeground(".post-new")
    });

    // 글 삭제
    $("body").on("click", ".post .delete", function() {
        
        var idx = $(this).data("idx");

        if (Number(idx) <= 0) {
            alert("삭제할 글을 선택해주세요.");
            return;
        }    

        if (!confirm("삭제하겠습니까?")) {
            return;    
        }

        deletePost(idx);
        selectPostList();
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
        tx.executeSql("DROP TABLE tb_post", [], loadAndReset, errorHandler);
        tx.executeSql("DROP TABLE tb_comment", [], loadAndReset, errorHandler);
    });

    resetPost(); 
    initDatabase();
}

//게시글 작성
function insertPost(username, title, content) {
    var strSql = "INSERT INTO tb_post (username, title, content) VALUES (?, ?, ?)";

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [username, title, content], loadAndReset, errorHandler);
    });
}

//댓글 작성
function insertComment(username, content, postid) {
    var strSql = "INSERT INTO tb_comment (username, content, postid) VALUES (?, ?, ?)";

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [username, content, postid], loadAndReset, errorHandler);
    });
}

//게시글 수정
function updatePost(username, title, content, idx) {
    var strSql = "UPDATE tb_post SET username = ?, title = ?, content = ? WHERE idx = ?";

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [username, title, content, idx], loadAndReset, errorHandler);
    });
}

//댓글 수정
function updateComment(username, content, idx) {
    var strSql = "UPDATE tb_comment SET username = ?, content = ? WHERE idx = ?";

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [username, content, idx], loadAndReset, errorHandler);
    });
}

//게시글 삭제
function deletePost(idx) {

    var strSql = "DELETE FROM tb_comment WHERE postid=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [Number(idx)], loadAndReset, errorHandler);
    });

    var strSql = "DELETE FROM tb_post WHERE idx=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [Number(idx)], loadAndReset, errorHandler);
    });
}

//댓글 삭제
function deleteComment(idx) {
    var strSql = "DELETE FROM tb_comment WHERE idx=?";
    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [Number(idx)], loadAndReset, errorHandler);
    });
}

//게시글 조회
function selectPostList() {
    var strSql = "SELECT * FROM tb_post order by idx desc";
    $(".post-read").html('');

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [], function (tx, result) {
            dataset = result.rows;
            var str = '<div class="flex row post header">\n'
                + '<span class="num">번호</span>\n'
                + '<span class="title">제목</span>\n'
                + '<span class="user">작성자</span>\n'
                + '<span class="date">작성 시간</span>\n'
                + '<span class="control">기타 작업</span>\n'
                + '</div>';

            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) {
                    item = dataset.item(i);
                    str += '<div class="flex row post">\n'
                        + '<span class="num">' + (i + 1) + '</span>\n'
                        + '<span class="title">' + item['title'] + '</span>\n'
                        + '<span class="user">' + item['username'] + '</span>\n'
                        + '<span class="date">' + item['regdate'] + '</span>\n'
                        + '<div class="control">\n'
                        + '<span class="button edit" data-no="' + i + '" data-idx="' + item['idx'] + '">수정</span>\n'
                        + '<span class="button delete" data-no="' + i + '"data-idx="' + item['idx'] + '">삭제</span>\n'
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

function selectCommentList(idx) {
    var strSql = "SELECT * FROM tb_comment WHERE postid=? order by idx asc";
    $(".comment-read").html('');

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [Number(idx)], function (tx, result) {
            dataset = result.rows;
            var str = '';

            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) {
                    item = dataset.item(i);
                    str += '<div class="flex row comment">\n'
                    + '<span class="user">' + item['username'] + '</span>\n'
                    + '<span class="content">' + item['content'] + '</span>\n'
                    + '<span class="date">' + item['regdate'] + '</span>\n'
                    + '<div class="control">\n'
                    + '<span class="button edit" data-no="' + i + '" data-idx="' + item['idx'] + '">수정</span>\n'
                    + '<span class="button delete" data-no="' + i + '" data-idx="' + item['idx'] + '">삭제</span>\n'
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

function loadRecord(no) {
    var item = dataset.item(no);
    $("#post-new-title").val((item['title']).toString());
    $("#post-new-name").val((item['username']).toString());
    $("#post-new-content").val((item['content']).toString());
}


function loadAndReset() {
    resetPost();
    selectPostList();
}

function resetPost() {
    $("#post-new-title").val("");
    $("#post-new-name").val("");
    $("#post-new-content").val("");
}

function resetComment() {
    $("#post-comment-name").val("");
    $("#post-comment-content").val("");
}

//.post-new .post-list .post-read
function selectForeground(section) {
    $(".mainpage .active").removeClass("active");
    $(section).addClass("active");
}

function errorHandler(transaction, error) {
    console.error(error + 'Error: ' + error.message + ' (Code ' + error.code + ')');
}

function insertTestDB() {
    systemDB.transaction(function (tx) {
        //tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '1번째 글입니다.', '1번째 글입니다.')", [], null, errorHandler);
        //tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '2번째 글입니다.', '2번째 글입니다.')", [], null, errorHandler);
        //tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '3번째 글입니다.', '3번째 글입니다.')", [], null, errorHandler);

        tx.executeSql("INSERT INTO tb_comment(username, content, postid) values('test', '1번째 글입니다.', 7)", [], null, errorHandler);
        tx.executeSql("INSERT INTO tb_comment(username, content, postid) values('test', '2번째 글입니다.', 8)", [], null, errorHandler);
        tx.executeSql("INSERT INTO tb_comment(username, content, postid) values('test', '3번째 글입니다.', 9)", [], null, errorHandler);
    });
}