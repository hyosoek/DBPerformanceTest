class RegexPatterns {
    constructor() {
        this.id = /^[A-Za-z0-9]{0,32}$/;
        this.password = /^[A-Za-z0-9!@#$%^&*()\\-_=+\\|[\]{};:'",.<>/?`~]{4,32}$/;
        this.name = /^[A-Za-z가-힣]{1,32}$/;
        this.mail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        this.date = /^\d{4}-\d{1,2}-\d{1,2}$/;
        this.contact = /^\d{9,11}$/;
        this.time = /^\d{4}-\d{2}-\d{2} $/;
        this.postTitle = /^.{1,32}$/;
        this.postDetail = /^.{1,1024}$/;
        this.commentDetail = /^.{1,512}$/;
        this.ip = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;    
    }
}

module.exports = new RegexPatterns();
