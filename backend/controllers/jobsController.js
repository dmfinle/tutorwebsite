const Job = require("../models/job");

//add
exports.newJob = async (req, res) => {
  const newJob = new Job(req.body);

  try {
    const savedJob = await newJob.save();
    res.status(200).json(savedJob);
  } catch (err) {
    res.status(500).json(err);
  }
};

//gets all jobs. TODO paginate this
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ read: { $nin: [req.params.userId] } });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.patchJobs = async (req, res) => {
  try {
    console.log(req.body.read);
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { read: req.body.read } }
    );

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json(err);
  }
};
