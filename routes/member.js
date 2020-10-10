const express = require("express");
const router = express.Router();
const {
  create,
  list,
  listAllMembersCategoriesTags,
  read,
  remove,
  update,
  photo,
  memberSearch,
} = require("../controllers/member");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

router.post("/member", requireSignin, adminMiddleware, create);
router.get("/members", list);
router.post("/members-categories-tags", listAllMembersCategoriesTags);
router.get("/member/:slug", read);
router.delete("/member/:slug", requireSignin, adminMiddleware, remove);
router.put("/member/:slug", requireSignin, adminMiddleware, update);

router.get("/member/photo/:slug", photo);
router.get("/members/search", memberSearch);

module.exports = router;
