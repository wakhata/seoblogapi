const Member = require("../models/member");
const Category = require("../models/category");
const Tag = require("../models/tag");
const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const fs = require("fs");
const { smartTrim } = require("../helpers/blog");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not upload",
      });
    }
    const {
      cname,
      contact,
      mobile,
      address,
      email,
      location,
      body,
      categories,
      tags,
    } = fields;

    if (!cname || !cname.length) {
      return res.status(400).json({
        error: "Company name is required",
      });
    }
    if (!contact || !contact.length) {
      return res.status(400).json({
        error: "contact is required",
      });
    }
    if (!mobile || !mobile.length) {
      return res.status(400).json({
        error: "mobile is required",
      });
    }
    if (!address || !address.length) {
      return res.status(400).json({
        error: "address is required",
      });
    }
    if (!email || !email.length) {
      return res.status(400).json({
        error: "email is required",
      });
    }
    if (!location || !location.length) {
      return res.status(400).json({
        error: "location is required",
      });
    }

    if (!body || body.length < 200) {
      return res.status(400).json({
        error: "Content is too short",
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: "At least one category is required",
      });
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: "At least one tag is required",
      });
    }

    let member = new Member();
    member.cname = cname;
    member.contact = contact;
    member.mobile = mobile;
    member.address = address;
    member.email = email;
    member.location = location;
    member.body = body;
    member.excerpt = smartTrim(body, 320, " ", " ... ");
    member.slug = slugify(cname).toLowerCase();
    member.postedBy = req.user._id;
    let arrayOfCategories = categories && categories.split(",");
    let arrayOfTags = tags && tags.split(",");

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: "Image should be less then 1mb in size",
        });
      }
      member.photo.data = fs.readFileSync(files.photo.path);
      member.photo.contentType = files.photo.type;
    }

    member.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      // res.json(result);
      Member.findByIdAndUpdate(
        result._id,
        { $push: { categories: arrayOfCategories } },
        { new: true }
      ).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        } else {
          Member.findByIdAndUpdate(
            result._id,
            { $push: { tags: arrayOfTags } },
            { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            } else {
              res.json(result);
            }
          });
        }
      });
    });
  });
};

exports.list = (req, res) => {
  Member.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id cname contact mobile address email location excerpt slug body categories tags postedBy createdAt updateAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.listAllMembersCategoriesTags = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let members;
  let categories;
  let tags;

  Member.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username profile")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id cname contact mobile address email location excerpt slug body categories tags postedBy createdAt updateAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      members = data; // members
      // get all categories
      Category.find({}).exec((err, c) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        categories = c; // categories
        // get all tags
        Tag.find({}).exec((err, t) => {
          if (err) {
            return res.json({
              error: errorHandler(err),
            });
          }
          tags = t;
          // return all members categories tags
          res.json({ members, categories, tags, size: members.length });
        });
      });
    });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Member.findOne({ slug })
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id cname contact mobile address email location excerpt slug body categories tags postedBy createdAt updateAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Member.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Member deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Member.findOne({ slug }).exec((err, oldMember) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not upload",
        });
      }
      let slugBeforeMerge = oldMember.slug;
      oldMember = _.merge(oldMember, fields);
      oldMember.slug = slugBeforeMerge;

      const {
        cname,
        contact,
        body,
        mobile,
        address,
        email,
        location,
        desc,
        categories,
        tags,
      } = fields;

      if (body) {
        oldMember.excerpt = smartTrim(body, 320, " ", " ...");
        oldMember.desc = stripHtml(body.substring(0, 160));
      }
      if (categories) {
        oldMember.categories = categories.split(",");
      }
      if (tags) {
        oldMember.tags = tags.split(",");
      }
      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: "Image should be less then 1mb in size",
          });
        }
        oldMember.photo.data = fs.readFileSync(files.photo.path);
        oldMember.photo.contentType = files.photo.type;
      }
      oldMember.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(result);
      });
    });
  });
};

exports.photo = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Member.findOne({ slug })
    .select("photo")
    .exec((err, member) => {
      if (err || !member) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.set("Content-Type", member.photo.contentType);
      return res.send(member.photo.data);
    });
};

exports.listRelatedMember = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const { _id, categories } = req.body.member;

  Member.find({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate("postedBy", "_id name username profile")
    .select("title slug excerpt postedBy createdAt updatedAt")
    .exec((err, members) => {
      if (err) {
        return res.status(400).json({
          error: "members not found",
        });
      }
      res.json(members);
    });
};

exports.memberSearch = (req, res) => {
  const { search } = req.query;
  if (search) {
    Member.find(
      {
        $or: [
          { cname: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { contact: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      },
      (err, members) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(members);
      }
    ).select("-photo -body");
  }
};

exports.listMemberByUser = (req, res) => {
  User.findOne({ username: req.params.username }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let userId = user._id;
    Member.find({ postedBy: userId })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id cname contact mobile address email location excerpt slug body categories tags postedBy createdAt updateAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(data);
      });
  });
};
