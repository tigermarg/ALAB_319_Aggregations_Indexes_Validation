import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

//Get single grade entry by id
async function getSingleGrade(req,res){
    try {
        let query = { _id: new ObjectId(req.params.id)};
        let collection = await db.collection('grades');

        let result = await collection.findOne(query);

        res.json(result);

    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: `Server Error`})
    }
}

// Get grades by student_id
async function getStudentGrades(req, res) {
    try {
      let query = { student_id: Number(req.params.id) };
      let collection = await db.collection('grades');

      let results = await collection.find(query).toArray();

      res.json(results);

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  }

// Get grades by class_id
  async function getClassGrades(req, res) {
    try {
      let query = { class_id: Number(req.params.id) };
      let collection = await db.collection('grades');

      let results = await collection.find(query).toArray();

      res.json(results);

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  }

//Create new grades in DB
async function createGrade(req, res){
    try{
        let collection = await db.collection('grades');

        let results = await collection.insertOne(req.body);

        res.json(results);

    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: `Server Error` })
    }
  }

//ALL class averages for one learner
async function studentClassesAvg(req, res){
  try {
    let collection = await db.collection('grades');

    let results = await collection.aggregate([
      {
        $match: { student_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ]).toArray();

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
}

// 319.4 LAB--------------------------------------------------------------------------------------------------------------

//Stats percentage above 70
async function studentStats(req, res){
  try {
    let collection = await db.collection('grades');

    let results = await collection.aggregate([
      {
        '$project': {
          'avg': {
            '$avg': '$scores.score'
          }
        }
      }, {
        '$match': {
          'avg': {
            '$gt': 70
          }
        }
      }, {
        '$count': 'numberOfEntries'
      }, {
        '$lookup': {
          'from': 'grades', 
          'pipeline': [
            {
              '$count': 'totalCount'
            }
          ], 
          'as': 'totalCount'
        }
      }, {
        '$unwind': {
          'path': '$totalCount', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'numberOfEntries': 1, 
          'totalCount': 1, 
          'percentageAbove70': {
            '$multiply': [
              {
                '$divide': [
                  '$numberOfEntries', {
                    '$ifNull': [
                      '$totalCount.totalCount', 1
                    ]
                  }
                ]
              }, 100
            ]
          }
        }
      }
    ]);

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
}

//Stats for specific student above 70
async function singleStudentStats(req, res){
  try {
    let collection = await db.collection('grades');

    let results = await collection.aggregate([
      {
        '$project': {
          'class_id': 1, 
          'avg': {
            '$avg': '$scores.score'
          }
        }
      }, {
        '$match': {
          'avg': {
            '$gt': 70
          }
        }
      }, {
        '$count': 'numberOfEntries'
      }, {
        '$lookup': {
          'from': 'grades', 
          'pipeline': [
            {
              '$count': 'totalCount'
            }
          ], 
          'as': 'totalCount'
        }
      }, {
        '$unwind': {
          'path': '$totalCount', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'numberOfEntries': 1, 
          'totalCount': 1, 
          'percentageAbove70': {
            '$multiply': [
              {
                '$divide': [
                  '$numberOfEntries', {
                    '$ifNull': [
                      '$totalCount.totalCount', 1
                    ]
                  }
                ]
              }, 100
            ]
          }
        }
      }
    ]).toArray();

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
}


export default { getSingleGrade, getStudentGrades, getClassGrades, createGrade, studentClassesAvg, studentStats, singleStudentStats };