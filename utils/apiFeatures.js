class APIFeatures {
  constructor(Model, query) {
    this.Model = Model;
    this.query = query;
  }
  filter() {
    const excludedFields = ['sort', 'page', 'limit', 'field'];
    let queryObject = { ...this.query };

    excludedFields.forEach((el) => delete queryObject[el]);

    queryObject = JSON.parse(
      JSON.stringify(queryObject).replace(
        /\bgte|gt|lte|lt\b/g,
        (match) => `$${match}`
      )
    );
    this.Model = this.Model.find(queryObject);
    return this;
  }
  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(',').join(' ');
      this.Model = this.Model.sort(sortBy);
    } else {
      this.Model = this.Model.sort('-price');
    }
    return this;
  }
  limitFields() {
    if (this.query.fields) {
      const selectBy = this.query.fields.split(',').join(' ');
      this.Model = this.Model.select(selectBy);
    } else {
      this.Model = this.Model.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = +this.query.page || 1;
    const limit = +this.query.limit || 100;
    const skip = (page - 1) * limit;
    this.Model = this.Model.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
