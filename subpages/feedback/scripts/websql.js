var systemDB;
var dataset;

$(document).ready(function () {
    initDatabase();

    $(".test").on("click", function() {

        insertTestDB();
    });

    // 테이블 삭제
    $(".drop").on("click", function () {

        if (!confirm("테이블을 삭제하겠습니까?")) {
            return;
        }

        dropTable();
    });

    // // 입력
    // $("#btn_insert").click(function() {
    //     var username = $('#username').val().trim(); 
    //     var content = $('#content').val().trim();

    //     if (username === "" || content === "") {
    //         alert("글을 적어주세요.");
    //         $('#username').focus();
    //         return;
    //     }

    //     //insertDB(systemDB);
    // });

    // // 리스트 수정버튼
    // $("body").on("click", ".btn_edit", function() {
    //     var no = $(this).data("no");
    //     var idx = $(this).data("idx");
    //     $("#id").val(idx);
    //     loadRecord(no);
    // });

    // 업데이트
    $("body").on("click", ".edit", function() {
        
        var username = $('#username').val().trim(); 
        var content = $('#content').val().trim();
        var idx = $("#id").val(); 

        if (username === "" || content === "" || Number(idx) <= 0) {
            alert("글을 적어주세요.");
            $('#username').focus();
            return;
        }

        updateDB();
    });

    // 삭제
    $("body").on("click", ".delete", function() {
        
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


    // 글 지우기
    //$("#btn_reset").click(resetForm);
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

    // systemDB.transaction(function (tx) { 
    //     tx.executeSql(strCreate, [], null, errorHandler);    
    // });

    //댓글 테이블
    strCreateComment = "CREATE TABLE IF NOT EXISTS tb_comment"
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
    });

    systemDB.transaction(function (tx) {
        tx.executeSql("DROP TABLE tb_comment", [], loadAndReset, errorHandler);
    });

    //resetForm(); 
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
function updatePost(username, content, idx) {
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
    $(".post-list").html('');

    systemDB.transaction(function (tx) {
        tx.executeSql(strSql, [], function (tx, result) {
            dataset = result.rows;
            var str = '<div class="flex row post header">\n'
                + '<span class="post-num">번호</span>\n'
                + '<span class="post-title">제목</span>\n'
                + '<span class="post-user">작성자</span>\n'
                + '<span class="post-date">작성 시간</span>\n'
                + '<span class="post-control">기타 작업</span>\n'
                + '</div>';

            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) {
                    item = dataset.item(i);
                    str += '<div class="flex row post">'
                        + '<span class="post-num">' + (i + 1) + '</span>\n'
                        + '<span class="post-title">' + item['title'] + '</span>\n'
                        + '<span class="post-user">' + item['username'] + '</span>\n'
                        + '<span class="post-date">' + item['regdate'] + '</span>\n'
                        + '<div class="post-control"\n>'
                        + '<span class="button edit" data-no="' + i + '" data-idx="' + item['idx'] + '">edit</span>\n'
                        + '<span class="button delete" data-no="' + i + '"data-idx="' + item['idx'] + '">delete</span>\n'
                        + '</div>'
                        + '</div>';
                }
            }
            else {
                str += "작성된 글이 없습니다.";
            }

            $(".post-list").html(str);
            //console.log(str);
        });
    });
}

function loadRecord(no) {
    var item = dataset.item(no);
    $("#username").val((item['username']).toString());
    $("#content").val((item['content']).toString());
}


function loadAndReset() {
    resetForm();
    selectPostList();
}

function resetForm() {
    $("#username").val("");
    $("#content").val("");
}

function errorHandler(transaction, error) {
    console.error(error + 'Error: ' + error.message + ' (Code ' + error.code + ')');
}

function insertTestDB(db) {
    systemDB.transaction(function (tx) {
        tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '1번째 글입니다.', '1번째 글입니다.')", [], null, errorHandler);
        tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '2번째 글입니다.', '2번째 글입니다.')", [], null, errorHandler);
        tx.executeSql("INSERT INTO tb_post(username, title, content) values('test', '3번째 글입니다.', '3번째 글입니다.')", [], null, errorHandler);
    });
}