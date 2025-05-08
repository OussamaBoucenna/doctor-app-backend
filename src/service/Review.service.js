const Review = require('../model/Review.model');
const User = require('../model/User.model');
const Doctor = require('../model/Doctor.model');

module.exports = {
  async getAllReviews() {
    return await Review.findAll({
      include: [
        {
          model: User,
          attributes: ['first_name', 'image'],
        },
        {
          model: Doctor,
          attributes: ['doctor_id']
        }
      ]
    });
  },

  async getReviewById(id) {
    return await Review.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['first_name', 'image']
        },
        {
          model: Doctor,
          attributes: ['doctor_id']
        }
      ]
    });
  },

  async getReviewsByDoctor(doctor_id) {
    try {
      const reviews = await Review.findAll({
        where: { doctor_id },
        include: [
          {
            model: User,
            attributes: ['first_name', 'last_name', 'image']
          }
        ],
        order: [['review_id', 'DESC']]
      });
  
      return reviews.map(review => ({
        id: review.review_id.toString(),
        doctor_id: review.doctor_id.toString(),
        reviewerName: review.USER
          ? `${review.USER.first_name} ${review.USER.last_name}`
          : 'Unknown',
        reviewerImage:  null,
        rating: review.rating,
        comment: review.comment
      }));
    } catch (error) {
      throw error;
    }
  },
  
  

  async createReview(data) {
    return await Review.create(data);
  },

  async updateReview(id, data) {
    const review = await Review.findByPk(id);
    if (!review) throw new Error('Review not found');
    return await review.update(data);
  },

  async deleteReview(id) {
    const review = await Review.findByPk(id);
    if (!review) throw new Error('Review not found');
    return await review.destroy();
  }
};
