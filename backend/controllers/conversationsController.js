const Conversation = require("../models/conversation");

//new conversation

exports.newConvo = async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const existingConvo = await Conversation.findOne({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });

    if (existingConvo === null) {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } else {
      res.status(200).json(existingConvo);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//get conversation of user
//TODO go back and limit aka server side pagination

exports.getConvo = async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
};
