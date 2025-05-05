const reviewService = require('../service/Review.service');

module.exports = {
  async getAll(req, res) {
    try {
      const reviews = await reviewService.getAllReviews();
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getOne(req, res) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (!review) return res.status(404).json({ error: 'Review not found' });
      res.json(review);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getReviewsByDoctor (req, res) {
    const { doctor_id } = req.params;
    try {
      const reviews = await reviewService.getReviewsByDoctor(doctor_id);
      res.status(200).json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews', error: err.message });
    }
  },
  

  async create(req, res) {
    try {
      const newReview = await reviewService.createReview(req.body);
      res.status(201).json(newReview);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await reviewService.updateReview(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await reviewService.deleteReview(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
