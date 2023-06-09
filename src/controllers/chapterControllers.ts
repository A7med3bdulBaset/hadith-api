import { RequestHandler } from "express";

import { hadithDB } from "../mongodb.js";
import { without_id } from "./../helpers/remove_id.js";

const getChapterById: RequestHandler = async (req, res) => {
	const { id: ID } = req.query;
	const id = parseInt(ID as string);

	if (!id) {
		return res.status(409).json({
			message:
				"The id query is required and must be number. (e.g. /chapter?id=5)",
		});
	}

	const chapters = hadithDB.collection("chapters");

	const chapter = await chapters.findOne({
		id: +id,
	});

	if (chapter) {
		return res.status(200).json(without_id(chapter));
	} else {
		const chaptersCount = await chapters.countDocuments();

		return res.status(404).json({
			message: `There is no chapter with id ${id}. Try a vaild id from 1 - ${chaptersCount}`,
		});
	}
};

const getBookChapters: RequestHandler = async (req, res) => {
	const { id: ID } = req.params;
	const id = parseInt(ID as string);

	if (!id) {
		return res.status(409).json({
			message:
				"The book id query is required and must be number. (e.g. /book/chapters/1 for Sahih Bukhari chapters)",
		});
	}

	const chapters = (await hadithDB
		.collection("chapters")
		.find({ bookId: id })
		.project({ _id: 0 })
		.sort({ id: 1 })
		.toArray()) as Chapter[];

	if (!chapters.length) {
		return res.status(404).json({
			message: "There is no chapters in the database.",
		});
	}

	return res.status(200).json(chapters);
};

const getAllChapters: RequestHandler = async (_, res) => {
	const chapters = await hadithDB
		.collection("chapters")
		.find({})
		.project({ _id: 0 })
		.sort({ id: 1 })
		.toArray();

	if (!chapters) {
		return res.status(404).json({
			message: "There is no chapters in the database.",
		});
	}

	return res.status(200).json(chapters);
};

export { getChapterById, getAllChapters, getBookChapters };
