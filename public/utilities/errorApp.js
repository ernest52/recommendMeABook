export default class extends Error {
  constructor(message = "sth went wrong", status = 500, page = "error") {
    super();
    this.message = message;
    this.status = status;
  }
}
