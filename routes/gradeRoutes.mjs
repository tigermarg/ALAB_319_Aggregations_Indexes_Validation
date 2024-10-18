import express from 'express';
import db from '../db/conn.mjs';
import gradesCTL from '../controllers/gradesController.mjs';

const router = express.Router();

//Get grades by id (endpoint)
router.get('/:id', gradesCTL.getSingleGrade);

//Get grades by student_id
router.get('/student/:id', gradesCTL.getStudentGrades)

//Get grades by class_id
router.get('/class/:id', gradesCTL.getClassGrades)

//Add new grade to db using POST
router.post('/', gradesCTL.createGrade)

//Get weighted average for learner across all classes
router.get('/student/:id/avg', gradesCTL.studentClassesAvg)

// 319.4 LAB--------------------------------------------------------------------------------------------------------------


//Get route for stats above 70
router.get('/stats', gradesCTL.studentStats)

//Get route for specific student stats
router.get('/stats/:id', gradesCTL.singleStudentStats)

export default router;