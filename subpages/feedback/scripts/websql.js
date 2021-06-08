var systemDB;
var dataset;

$(document).ready(function () {
    initDatabase(); 
    
    // 입력
    $("#btn_insert").click(function() {
        var username = $('#username').val().trim(); 
        var content = $('#content').val().trim();
        
        if (username === "" || content === "") {
            alert("글을 적어주세요.");
            $('#username').focus();
            return;
        }

        //insertDB(systemDB);
    });
    
    // 리스트 수정버튼
    $("body").on("click", ".btn_edit", function() {
        var no = $(this).data("no");
        var idx = $(this).data("idx");
        $("#id").val(idx);
        loadRecord(no);
    });
    
    // 업데이트
    $("#btn_update").click(function() {
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
    $("body").on("click", ".btn_delete", function() {
        var idx = $(this).data("idx");
        
        if (Number(idx) <= 0) {
            alert("삭제할 글을 선택해주세요.");
            return;
        }    
        
        if (!confirm("삭제를 하겠습니까?")) {
            return;    
        }

        deleteDB(systemDB, idx);
        selectAllList(systemDB, idx);
    });
    
    // 테이블 삭제
    $("#btn_drop").click(function() {

        if (!confirm("테이블을 삭제하겠습니까?")) {
            return;    
        }
        dropTable();
    });
    
    // 글 지우기
    $("#btn_reset").click(resetForm); 
});

//DB 초기화
function initDatabase() {
    if (!window.openDatabase) { 
        alert("현재 브라우저는 Web SQL Database를 지원하지 않습니다");
    } else {
        var shortName = "Feedback";
        var version = "1.0";
        var displayName = "Feedback";
        var maxSize = 1024 * 128; // in bytes
        systemDB = openDatabase(shortName, version, displayName, maxSize);
    }  
    
    createTable();
    selectAllList();
}

//테이블 생성
function createTable() {

    //게시글 테이블
    var strCreate = "CREATE TABLE IF NOT EXISTS tb_post"
                  + " (idx INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"
                  + " username TEXT NOT NULL,"
                  + " title TEXT NOT NULL,"
                  + " content TEXT NOT NULL,"
                  + " regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";
    
    systemDB.transaction(function (tx) { 
        tx.executeSql(strCreate);    
    });

    //댓글 테이블
    strCreate = "CREATE TABLE IF NOT EXISTS tb_comment"
                  + " (idx INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"
                  + " username TEXT NOT NULL,"
                  + " content TEXT NOT NULL,"
                  + " postid INTEGER NOT NULL,"
                  + " regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)";

    systemDB.transaction(function (tx) { 
        tx.executeSql(strCreate);    
    });
}

// 테이블 삭제
function dropTable() { 
    
    var strSql = "DROP TABLE tb_post, tb_comment"; 
    systemDB.transaction(function (tx) { 
        tx.executeSql(strSql, [], loadAndReset, errorHandler); 
    }); 

    resetForm(); 
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

    strSql = "DELETE FROM tb_post WHERE idx=?";        
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
function selectPostList(db) { 
    var strSql = "SELECT * FROM tb_post order by idx desc"; 
    $("#postlist").html('');
    systemDB.transaction(function (tx) { 
        tx.executeSql(strSql, [], function (tx, result) { 
            dataset = result.rows; 
            var str = "<div class='post-item'>";
            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) { 
                    item = dataset.item(i); 
                    str += "<div>"+item['username']+" : "+item['title']+" : "+item['regdate']
                        + " <span class='btn_edit' data-no='"+i+"' data-idx='"+item['idx']+"'>edit</span>"
                        + " <span class='btn_delete' data-no='"+i+"' data-idx='"+item['idx']+"'>delete</span>"
                        + "</div>";                 
                }
            } else {
                str += "작성된 글이 없습니다.";
            }
            str += "</ol>";  
            $("#postlist").html(str);
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
    selectAllList(systemDB);
} 

function resetForm() {
    $("#username").val(""); 
    $("#content").val(""); 
}

function errorHandler(error) { 
    alert('Error: '+error.message+' (Code '+error.code+')');
}

function selectAllList(db) { 
    var strSql = "SELECT * FROM tbl_board order by idx desc"; 
    $("#boardlist").html('');
    systemDB.transaction(function (tx) { 
        tx.executeSql(strSql, [], function (tx, result) { 
            dataset = result.rows; 
            var str = "<ol>";
            if (dataset.length > 0) {
                for (var i = 0, item = null; i < dataset.length; i++) { 
                    item = dataset.item(i); 
                    str += "<li>"+item['username']+" : "+item['content']+" : "+item['regdate']
                        + " <span class='btn_edit' data-no='"+i+"' data-idx='"+item['idx']+"'>edit</span>"
                        + " <span class='btn_delete' data-no='"+i+"' data-idx='"+item['idx']+"'>delete</span>"
                        + "</li>";                 
                }
            } else {
                str += "리스트가 없습니다.";
            }
            str += "</ol>";  
            $("#boardlist").html(str);
        }); 
    }); 
}


function insertTestDB(db) {
    systemDB.transaction(function (tx) { 
        tx.executeSql("INSERT INTO tbl_board(username, content) values('test', '1번째 글입니다.')");    
        tx.executeSql("INSERT INTO tbl_board(username, content) values('test', '2번째 글입니다.')");  
        tx.executeSql("INSERT INTO tbl_board(username, content) values('test', '3번째 글입니다.')");  
    });
}