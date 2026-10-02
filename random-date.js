(() => {
  const YEARS_IN_LAST_CENTURY = 100;

  class RandomDate {
    #currentDate;

    constructor(initialDate = RandomDate.withinLastCentury()) {
      if (!(initialDate instanceof Date) || Number.isNaN(initialDate.getTime())) {
        throw new TypeError("initialDate must be a valid Date.");
      }

      this.#currentDate = new Date(initialDate.getTime());
    }

    get currentDate() {
      return new Date(this.#currentDate.getTime());
    }

    randomize() {
      this.#currentDate = RandomDate.withinLastCentury();
      return this.currentDate;
    }

    static withinLastCentury(now = new Date()) {
      const start = new Date(now.getTime());
      start.setFullYear(start.getFullYear() - YEARS_IN_LAST_CENTURY);

      const span = now.getTime() - start.getTime();
      return new Date(start.getTime() + Math.floor(Math.random() * (span + 1)));
    }
  }

  window.RandomDateApp = Object.assign(window.RandomDateApp ?? {}, { RandomDate });
})();
