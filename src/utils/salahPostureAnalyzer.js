/**
 * SiratAI Salah Posture Coach - Core Analysis Engine
 * Evaluates physical posture based on body landmarks and confidence scores.
 */

// Helper to calculate absolute angle formed at joint B by points A and C
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 180;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
};

// Helper to calculate distance between two 2D points
export const calculateDistance = (p1, p2) => {
  if (!p1 || !p2) return 999;
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const analyzeSalahPosture = (landmarks, targetPose = 'qiyam', selectedMadhhab = 'hanafi') => {
  // 1. Check if body landmarks are reliable (confidence check)
  if (!landmarks || landmarks.length < 29) {
    return {
      unreliable: true,
      posture: targetPose.charAt(0).toUpperCase() + targetPose.slice(1),
      overallScore: 0,
      status: "Red",
      voiceGuide: "Unable to analyse posture accurately. Please ensure your entire body is visible, there is good lighting, and the camera is at chest height.",
      nextCheck: "Adjust camera setup to begin tracking."
    };
  }

  // Extract key landmarks
  const nose = landmarks[0];
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lElbow = landmarks[13];
  const rElbow = landmarks[14];
  const lWrist = landmarks[15];
  const rWrist = landmarks[16];
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  const lKnee = landmarks[25];
  const rKnee = landmarks[26];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];
  
  // Calculate average visibility of key joints to check confidence
  const keyJoints = [lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle];
  const avgVisibility = keyJoints.reduce((acc, curr) => acc + (curr?.visibility !== undefined ? curr.visibility : 1), 0) / keyJoints.length;

  if (avgVisibility < 0.45) {
    return {
      unreliable: true,
      posture: targetPose.charAt(0).toUpperCase() + targetPose.slice(1),
      overallScore: 0,
      status: "Red",
      voiceGuide: "Unable to analyse posture accurately. Please ensure: Entire body is visible, Good lighting, Camera at chest height, Stand 2–3 meters from the camera.",
      nextCheck: "Ensure you are fully in the camera view."
    };
  }

  // Pre-calculate heights & midpoint references
  const headY = nose.y;
  const shoulderMid = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
  const hipMid = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
  const kneeMid = { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2 };
  const ankleMid = { x: (lAnkle.x + rAnkle.x) / 2, y: (lAnkle.y + rAnkle.y) / 2 };
  const bodyHeight = Math.abs(ankleMid.y - headY) || 1.0;

  // Track body part results
  const bodyAnalysis = [];
  const addPartAnalysis = (bodyPart, status, score, feedback) => {
    bodyAnalysis.push({ bodyPart, status, score, feedback });
  };

  // Visibility check helper
  const isPartVisible = (...parts) => {
    return parts.every(p => p && (p.visibility === undefined || p.visibility > 0.4));
  };

  const poseLower = targetPose.toLowerCase();
  
  // ==========================================
  // QIYAM (STANDING) POSTURE RULES
  // ==========================================
  if (poseLower === 'qiyam') {
    // 1. Head (Weight 10%)
    if (!isPartVisible(nose, lShoulder, rShoulder)) {
      addPartAnalysis("Head", "Not Visible", 0, "Head or neck is obstructed from view.");
    } else {
      const headOffset = Math.abs(nose.x - shoulderMid.x) / bodyHeight;
      if (headOffset < 0.05) {
        addPartAnalysis("Head", "Correct", 100, "Head is aligned perfectly and upright.");
      } else if (headOffset < 0.12) {
        addPartAnalysis("Head", "Slight Adjustment Needed", 75, "Tilt your head slightly to center it with your spine.");
      } else {
        addPartAnalysis("Head", "Incorrect", 40, "Keep your head centered and look naturally down towards the ground.");
      }
    }

    // 2. Shoulders (Weight 10%)
    if (!isPartVisible(lShoulder, rShoulder)) {
      addPartAnalysis("Shoulders", "Not Visible", 0, "Shoulders are not fully visible.");
    } else {
      const shoulderSlope = Math.abs(lShoulder.y - rShoulder.y) / bodyHeight;
      if (shoulderSlope < 0.02) {
        addPartAnalysis("Shoulders", "Correct", 100, "Shoulders are level and relaxed.");
      } else if (shoulderSlope < 0.05) {
        addPartAnalysis("Shoulders", "Slight Adjustment Needed", 80, "Keep your shoulders level; relax your right and left shoulders evenly.");
      } else {
        addPartAnalysis("Shoulders", "Incorrect", 50, "Align your shoulders level to avoid leaning to one side.");
      }
    }

    // 3. Back (Weight 20%)
    if (!isPartVisible(lShoulder, rShoulder, lHip, rHip)) {
      addPartAnalysis("Back", "Not Visible", 0, "Spine and back are not visible.");
    } else {
      // Calculate verticality of the spine (shoulders to hips)
      const spineSlope = Math.abs(shoulderMid.x - hipMid.x) / bodyHeight;
      if (spineSlope < 0.04) {
        addPartAnalysis("Back", "Correct", 100, "Spine is straight and upright.");
      } else if (spineSlope < 0.1) {
        addPartAnalysis("Back", "Slight Adjustment Needed", 80, "Straighten your back slightly and avoid slouching.");
      } else {
        addPartAnalysis("Back", "Incorrect", 50, "Straighten your posture and stand upright.");
      }
    }

    // 4. Hands (Weight 20%) - Evaluated based on selected Madhhab
    if (!isPartVisible(lWrist, rWrist, lElbow, rElbow)) {
      addPartAnalysis("Hands", "Not Visible", 0, "Hands or folded arms are not visible.");
    } else {
      const wristsCloseness = calculateDistance(lWrist, rWrist) / bodyHeight;
      const wristsY = (lWrist.y + rWrist.y) / 2;
      
      if (selectedMadhhab === 'hanafi') {
        // Hanafi: Hands folded below the navel (approx. hip level or slightly lower)
        const isBelowNavel = wristsY > hipMid.y - 0.02 && wristsY < hipMid.y + 0.15;
        const isFolded = wristsCloseness < 0.15;
        if (isBelowNavel && isFolded) {
          addPartAnalysis("Hands", "Correct", 100, "Hands are folded correctly below the navel (Hanafi position).");
        } else if (isFolded) {
          addPartAnalysis("Hands", "Slight Adjustment Needed", 75, "Hanafi madhhab suggests folding hands slightly lower, below the navel.");
        } else {
          addPartAnalysis("Hands", "Incorrect", 50, "Fold your right hand over your left wrist below the navel.");
        }
      } else if (selectedMadhhab === 'shafi_i' || selectedMadhhab === 'shafii') {
        // Shafi'i: Hands folded above the navel, below chest
        const isChestLevel = wristsY > shoulderMid.y + 0.15 && wristsY < hipMid.y - 0.02;
        const isFolded = wristsCloseness < 0.15;
        if (isChestLevel && isFolded) {
          addPartAnalysis("Hands", "Correct", 100, "Hands are folded correctly below the chest, above the navel (Shafi'i position).");
        } else if (isFolded) {
          addPartAnalysis("Hands", "Slight Adjustment Needed", 75, "Shafi'i madhhab suggests folding hands slightly higher, above the navel.");
        } else {
          addPartAnalysis("Hands", "Incorrect", 50, "Fold your right hand over your left wrist on your lower chest.");
        }
      } else if (selectedMadhhab === 'maliki') {
        // Maliki: Sadl (hands at the sides)
        const handSideL = Math.abs(lWrist.x - lHip.x) / bodyHeight;
        const handSideR = Math.abs(rWrist.x - rHip.x) / bodyHeight;
        const areDown = wristsY > hipMid.y;
        if (areDown && handSideL < 0.12 && handSideR < 0.12) {
          addPartAnalysis("Hands", "Correct", 100, "Hands are resting naturally at your sides (Maliki Sadl position).");
        } else {
          addPartAnalysis("Hands", "Incorrect", 55, "Allow your arms to rest naturally at your sides for the Maliki posture.");
        }
      } else {
        // Hanbali: Folded on chest or below navel (flexible)
        const isFolded = wristsCloseness < 0.15;
        const isFoldedLocation = wristsY > shoulderMid.y + 0.1 && wristsY < hipMid.y + 0.15;
        if (isFolded && isFoldedLocation) {
          addPartAnalysis("Hands", "Correct", 100, "Hands are folded correctly in Qiyam (Hanbali position).");
        } else {
          addPartAnalysis("Hands", "Incorrect", 50, "Fold your right hand over your left wrist on your chest or below the navel.");
        }
      }
    }

    // 5. Legs (Weight 15%)
    if (!isPartVisible(lKnee, rKnee, lHip, rHip, lAnkle, rAnkle)) {
      addPartAnalysis("Legs", "Not Visible", 0, "Legs are not fully in view.");
    } else {
      const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
      const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
      const kneesStraight = leftKneeAngle > 165 && rightKneeAngle > 165;
      
      if (kneesStraight) {
        addPartAnalysis("Legs", "Correct", 100, "Legs are straight and stable.");
      } else if (leftKneeAngle > 150 && rightKneeAngle > 150) {
        addPartAnalysis("Legs", "Slight Adjustment Needed", 80, "Straighten your knees fully without locking them.");
      } else {
        addPartAnalysis("Legs", "Incorrect", 50, "Stand straight; avoid bending your knees while standing.");
      }
    }

    // 6. Feet (Weight 15%)
    if (!isPartVisible(lAnkle, rAnkle)) {
      addPartAnalysis("Feet", "Not Visible", 0, "Feet are not visible.");
    } else {
      // Check feet separation distance
      const feetDistance = Math.abs(lAnkle.x - rAnkle.x) / bodyHeight;
      if (feetDistance > 0.08 && feetDistance < 0.22) {
        addPartAnalysis("Feet", "Correct", 100, "Feet are set comfortably apart.");
      } else if (feetDistance <= 0.08) {
        addPartAnalysis("Feet", "Slight Adjustment Needed", 80, "Widen your stance slightly to keep your feet apart.");
      } else {
        addPartAnalysis("Feet", "Slight Adjustment Needed", 75, "Bring your feet closer together (comfortably shoulder-width apart).");
      }
    }

    // 7. Alignment (Weight 10%)
    if (!isPartVisible(shoulderMid, hipMid, ankleMid)) {
      addPartAnalysis("Alignment", "Not Visible", 0, "Alignment markers are obscured.");
    } else {
      const leaning = Math.abs(shoulderMid.x - ankleMid.x) / bodyHeight;
      if (leaning < 0.06) {
        addPartAnalysis("Alignment", "Correct", 100, "Body weight is centered and balanced.");
      } else {
        addPartAnalysis("Alignment", "Slight Adjustment Needed", 75, "Distribute weight evenly; try not to lean forward or backward.");
      }
    }
  }

  // ==========================================
  // RUKU (BOWING) POSTURE RULES
  // ==========================================
  else if (poseLower === 'ruku' || poseLower === "ruku'") {
    // 1. Head (Weight 10%)
    if (!isPartVisible(nose, lShoulder, rShoulder, lHip, rHip)) {
      addPartAnalysis("Head", "Not Visible", 0, "Head or neck landmarks are hidden.");
    } else {
      // In Ruku, head should be aligned in line with the spine.
      const spineAngle = calculateAngle(hipMid, shoulderMid, nose);
      const headDev = Math.abs(180 - spineAngle);
      if (headDev < 18) {
        addPartAnalysis("Head", "Correct", 100, "Head is aligned perfectly with your spine.");
      } else if (headDev < 35) {
        addPartAnalysis("Head", "Slight Adjustment Needed", 80, "Keep your neck straight, aligning your head with your back.");
      } else {
        addPartAnalysis("Head", "Incorrect", 50, "Do not look up or drop your head too low; keep your head and neck aligned with your back.");
      }
    }

    // 2. Shoulders (Weight 10%)
    if (!isPartVisible(lShoulder, rShoulder)) {
      addPartAnalysis("Shoulders", "Not Visible", 0, "Shoulders are not visible.");
    } else {
      const shoulderSlope = Math.abs(lShoulder.y - rShoulder.y) / bodyHeight;
      if (shoulderSlope < 0.05) {
        addPartAnalysis("Shoulders", "Correct", 100, "Shoulders are kept relaxed and level.");
      } else {
        addPartAnalysis("Shoulders", "Slight Adjustment Needed", 80, "Keep shoulders level and relax both shoulders evenly.");
      }
    }

    // 3. Back (Weight 20%)
    if (!isPartVisible(shoulderMid, hipMid, kneeMid)) {
      addPartAnalysis("Back", "Not Visible", 0, "Spine is not visible.");
    } else {
      const rukuAngle = calculateAngle(shoulderMid, hipMid, kneeMid); // should be close to 90 degrees
      const backDev = Math.abs(90 - rukuAngle);
      
      if (backDev < 20) {
        addPartAnalysis("Back", "Correct", 100, "Back is completely straight and flat.");
      } else if (backDev < 35) {
        addPartAnalysis("Back", "Slight Adjustment Needed", 75, "Bend down more from your hips to get your back flatter, parallel to the ground.");
      } else {
        addPartAnalysis("Back", "Incorrect", 45, "Lower your upper body until your back is flat like a table.");
      }
    }

    // 4. Hands (Weight 20%)
    if (!isPartVisible(lWrist, rWrist, lKnee, rKnee, lElbow, rElbow)) {
      addPartAnalysis("Hands", "Not Visible", 0, "Hands or elbows are hidden.");
    } else {
      // Hands should grasp the knees.
      const distL = calculateDistance(lWrist, lKnee) / bodyHeight;
      const distR = calculateDistance(rWrist, rKnee) / bodyHeight;
      const handsOnKnees = distL < 0.12 && distR < 0.12;

      // Elbows should be straight.
      const elbowAngleL = calculateAngle(lShoulder, lElbow, lWrist);
      const elbowAngleR = calculateAngle(rShoulder, rElbow, rWrist);
      const elbowsStraight = elbowAngleL > 150 && elbowAngleR > 150;

      if (handsOnKnees && elbowsStraight) {
        addPartAnalysis("Hands", "Correct", 100, "Hands are firmly grasping the knees with straight elbows.");
      } else if (handsOnKnees) {
        addPartAnalysis("Hands", "Slight Adjustment Needed", 80, "Keep your hands on your knees but straighten your elbows.");
      } else if (elbowsStraight) {
        addPartAnalysis("Hands", "Slight Adjustment Needed", 75, "Ensure your hands are firmly placed on your knees.");
      } else {
        addPartAnalysis("Hands", "Incorrect", 50, "Place your hands firmly on your knees and keep your arms straight.");
      }
    }

    // 5. Legs (Weight 15%)
    if (!isPartVisible(lHip, rHip, lKnee, rKnee, lAnkle, rAnkle)) {
      addPartAnalysis("Legs", "Not Visible", 0, "Legs or knees are obscured.");
    } else {
      const kneeAngleL = calculateAngle(lHip, lKnee, lAnkle);
      const kneeAngleR = calculateAngle(rHip, rKnee, rAnkle);
      const kneesStraight = kneeAngleL > 155 && kneeAngleR > 155;

      if (kneesStraight) {
        addPartAnalysis("Legs", "Correct", 100, "Legs are straight and stable.");
      } else if (kneeAngleL > 140 && kneeAngleR > 140) {
        addPartAnalysis("Legs", "Slight Adjustment Needed", 75, "Straighten your knees slightly for a stable posture.");
      } else {
        addPartAnalysis("Legs", "Incorrect", 50, "Ensure your knees are straight and stable, not bent.");
      }
    }

    // 6. Feet (Weight 15%)
    if (!isPartVisible(lAnkle, rAnkle)) {
      addPartAnalysis("Feet", "Not Visible", 0, "Feet are not visible.");
    } else {
      const feetDistance = Math.abs(lAnkle.x - rAnkle.x) / bodyHeight;
      if (feetDistance > 0.08 && feetDistance < 0.22) {
        addPartAnalysis("Feet", "Correct", 100, "Feet are comfortably spaced.");
      } else {
        addPartAnalysis("Feet", "Slight Adjustment Needed", 80, "Keep your feet parallel and comfortably apart.");
      }
    }

    // 7. Alignment (Weight 10%)
    if (!isPartVisible(hipMid, ankleMid)) {
      addPartAnalysis("Alignment", "Not Visible", 0, "Alignment joints are not visible.");
    } else {
      const rukuLean = Math.abs(hipMid.x - ankleMid.x) / bodyHeight;
      if (rukuLean < 0.08) {
        addPartAnalysis("Alignment", "Correct", 100, "Weight is distributed equally and posture is balanced.");
      } else {
        addPartAnalysis("Alignment", "Slight Adjustment Needed", 75, "Shift your hips back slightly so they align over your ankles.");
      }
    }
  }

  // ==========================================
  // SUJOOD (PROSTRATION) POSTURE RULES
  // ==========================================
  else if (poseLower === 'sujood') {
    // 1. Head (Weight 10%)
    if (!isPartVisible(nose, lAnkle, rAnkle)) {
      addPartAnalysis("Head", "Not Visible", 0, "Head is not visible.");
    } else {
      const headToFloor = Math.abs(headY - ankleMid.y) / bodyHeight;
      if (headToFloor < 0.15) {
        addPartAnalysis("Head", "Correct", 100, "Forehead and nose are touching the ground correctly.");
      } else {
        addPartAnalysis("Head", "Incorrect", 50, "Lower your forehead and nose fully to the ground.");
      }
    }

    // 2. Shoulders (Weight 10%)
    if (!isPartVisible(lShoulder, rShoulder)) {
      addPartAnalysis("Shoulders", "Not Visible", 0, "Shoulders are not visible.");
    } else {
      const shoulderSlope = Math.abs(lShoulder.y - rShoulder.y) / bodyHeight;
      if (shoulderSlope < 0.06) {
        addPartAnalysis("Shoulders", "Correct", 100, "Shoulders are aligned.");
      } else {
        addPartAnalysis("Shoulders", "Slight Adjustment Needed", 80, "Keep your shoulders level and aligned.");
      }
    }

    // 3. Back (Weight 20%)
    if (!isPartVisible(hipMid, shoulderMid, ankleMid)) {
      addPartAnalysis("Back", "Not Visible", 0, "Back is not visible.");
    } else {
      const hipsHigher = hipMid.y < shoulderMid.y - 0.05;
      if (hipsHigher) {
        addPartAnalysis("Back", "Correct", 100, "Hips are raised naturally, back is relaxed.");
      } else {
        addPartAnalysis("Back", "Slight Adjustment Needed", 80, "Ensure your hips are raised naturally above shoulder level.");
      }
    }

    // 4. Hands (Weight 20%)
    if (!isPartVisible(lWrist, rWrist, lElbow, rElbow, lAnkle, rAnkle)) {
      addPartAnalysis("Hands", "Not Visible", 0, "Hands or elbows are hidden.");
    } else {
      const wristsOnFloor = Math.abs((lWrist.y + rWrist.y) / 2 - ankleMid.y) / bodyHeight < 0.18;
      const elbowsLifted = lElbow.y < lWrist.y - 0.03 && rElbow.y < rWrist.y - 0.03;

      if (wristsOnFloor && elbowsLifted) {
        addPartAnalysis("Hands", "Correct", 100, "Palms are flat, elbows are raised correctly off the floor.");
      } else if (wristsOnFloor) {
        addPartAnalysis("Hands", "Slight Adjustment Needed", 75, "Lift your elbows and forearms off the floor.");
      } else if (elbowsLifted) {
        addPartAnalysis("Hands", "Slight Adjustment Needed", 75, "Ensure your palms are placed flat on the floor.");
      } else {
        addPartAnalysis("Hands", "Incorrect", 50, "Place your palms flat on the ground and lift your elbows off the floor.");
      }
    }

    // 5. Legs (Weight 15%)
    if (!isPartVisible(lKnee, rKnee)) {
      addPartAnalysis("Legs", "Not Visible", 0, "Knees are not visible.");
    } else {
      const kneeCloseness = Math.abs(lKnee.x - rKnee.x) / bodyHeight;
      if (kneeCloseness < 0.12) {
        addPartAnalysis("Legs", "Correct", 100, "Knees are touching the floor and placed close together.");
      } else {
        addPartAnalysis("Legs", "Slight Adjustment Needed", 80, "Keep your knees close together on the floor.");
      }
    }

    // 6. Feet (Weight 15%)
    if (!isPartVisible(lAnkle, rAnkle)) {
      addPartAnalysis("Feet", "Not Visible", 0, "Feet are not visible.");
    } else {
      const anklesCloseness = Math.abs(lAnkle.x - rAnkle.x) / bodyHeight;
      if (anklesCloseness < 0.12) {
        addPartAnalysis("Feet", "Correct", 100, "Feet are together with toes bent toward the Qiblah.");
      } else {
        addPartAnalysis("Feet", "Slight Adjustment Needed", 80, "Keep your feet close together with heels touching.");
      }
    }

    // 7. Alignment (Weight 10%)
    if (!isPartVisible(hipMid, ankleMid)) {
      addPartAnalysis("Alignment", "Not Visible", 0, "Alignment points are not visible.");
    } else {
      addPartAnalysis("Alignment", "Correct", 100, "Sujood alignment is balanced.");
    }
  }

  // ==========================================
  // JALSA & TASHAHHUD (SITTING) POSTURE RULES
  // ==========================================
  else if (poseLower === 'jalsa' || poseLower === 'tashahhud') {
    // 1. Head (Weight 10%)
    if (!isPartVisible(nose)) {
      addPartAnalysis("Head", "Not Visible", 0, "Head is not visible.");
    } else {
      addPartAnalysis("Head", "Correct", 100, "Head is upright and looking down towards the place of Sujood.");
    }

    // 2. Shoulders (Weight 10%)
    if (!isPartVisible(lShoulder, rShoulder)) {
      addPartAnalysis("Shoulders", "Not Visible", 0, "Shoulders are not visible.");
    } else {
      const slope = Math.abs(lShoulder.y - rShoulder.y) / bodyHeight;
      if (slope < 0.03) {
        addPartAnalysis("Shoulders", "Correct", 100, "Shoulders are level and relaxed.");
      } else {
        addPartAnalysis("Shoulders", "Slight Adjustment Needed", 80, "Keep your shoulders level and relaxed.");
      }
    }

    // 3. Back (Weight 20%)
    if (!isPartVisible(shoulderMid, hipMid)) {
      addPartAnalysis("Back", "Not Visible", 0, "Back is not visible.");
    } else {
      const straightness = Math.abs(shoulderMid.x - hipMid.x) / bodyHeight;
      if (straightness < 0.05) {
        addPartAnalysis("Back", "Correct", 100, "Back is straight and upright.");
      } else if (straightness < 0.12) {
        addPartAnalysis("Back", "Slight Adjustment Needed", 80, "Straighten your back slightly, avoiding slouching.");
      } else {
        addPartAnalysis("Back", "Incorrect", 55, "Straighten your back and avoid leaning forward.");
      }
    }

    // 4. Hands (Weight 20%)
    if (!isPartVisible(lWrist, rWrist, lKnee, rKnee)) {
      addPartAnalysis("Hands", "Not Visible", 0, "Hands are not visible.");
    } else {
      const distL = calculateDistance(lWrist, lKnee) / bodyHeight;
      const distR = calculateDistance(rWrist, rKnee) / bodyHeight;
      const isNearKnees = distL < 0.15 && distR < 0.15;
      
      if (isNearKnees) {
        const fingerRaiseText = poseLower === 'tashahhud' 
          ? " (Ready to raise index finger during Shahadah)"
          : "";
        addPartAnalysis("Hands", "Correct", 100, `Hands are placed correctly on thighs/knees${fingerRaiseText}.`);
      } else {
        addPartAnalysis("Hands", "Slight Adjustment Needed", 80, "Place your hands flat on your thighs or close to your knees.");
      }
    }

    // 5. Legs (Weight 15%)
    if (!isPartVisible(lHip, rHip, lKnee, rKnee, lAnkle, rAnkle)) {
      addPartAnalysis("Legs", "Not Visible", 0, "Legs are not fully visible.");
    } else {
      const angleL = calculateAngle(lHip, lKnee, lAnkle);
      const angleR = calculateAngle(rHip, rKnee, rAnkle);
      const isSitting = angleL < 90 && angleR < 90;
      
      if (isSitting) {
        addPartAnalysis("Legs", "Correct", 100, "Sitting posture is correct with knees fully bent.");
      } else {
        addPartAnalysis("Legs", "Incorrect", 60, "Lower your posture fully onto the floor.");
      }
    }

    // 6. Feet (Weight 15%)
    if (!isPartVisible(lAnkle, rAnkle)) {
      addPartAnalysis("Feet", "Not Visible", 0, "Feet are not visible.");
    } else {
      addPartAnalysis("Feet", "Correct", 100, "Feet are resting beneath the body correctly.");
    }

    // 7. Alignment (Weight 10%)
    if (!isPartVisible(hipMid, ankleMid)) {
      addPartAnalysis("Alignment", "Not Visible", 0, "Alignment points are not visible.");
    } else {
      const lean = Math.abs(hipMid.x - ankleMid.x) / bodyHeight;
      if (lean < 0.15) {
        addPartAnalysis("Alignment", "Correct", 100, "Sitting alignment is centered.");
      } else {
        addPartAnalysis("Alignment", "Slight Adjustment Needed", 80, "Keep your weight centered over your feet.");
      }
    }
  }

  // ==========================================
  // SALAM (TURNING HEAD) POSTURE RULES
  // ==========================================
  else if (poseLower === 'salam') {
    // 1. Head (Weight 10%)
    if (!isPartVisible(nose, lShoulder, rShoulder)) {
      addPartAnalysis("Head", "Not Visible", 0, "Head or shoulders are hidden.");
    } else {
      const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x) || 1;
      const noseDistToL = Math.abs(nose.x - lShoulder.x);
      const noseDistToR = Math.abs(nose.x - rShoulder.x);
      const hasTurned = noseDistToL < shoulderWidth * 0.28 || noseDistToR < shoulderWidth * 0.28;

      if (hasTurned) {
        addPartAnalysis("Head", "Correct", 100, "Head is turned correctly to the shoulder for Salam.");
      } else {
        addPartAnalysis("Head", "Incorrect", 60, "Turn your head fully to the right or left shoulder for Salam.");
      }
    }

    // 2. Shoulders (Weight 10%)
    if (!isPartVisible(lShoulder, rShoulder)) {
      addPartAnalysis("Shoulders", "Not Visible", 0, "Shoulders are hidden.");
    } else {
      addPartAnalysis("Shoulders", "Correct", 100, "Shoulders are level.");
    }

    // 3. Back (Weight 20%)
    if (!isPartVisible(shoulderMid, hipMid)) {
      addPartAnalysis("Back", "Not Visible", 0, "Back is not visible.");
    } else {
      const slope = Math.abs(shoulderMid.x - hipMid.x) / bodyHeight;
      if (slope < 0.05) {
        addPartAnalysis("Back", "Correct", 100, "Spine is upright and straight.");
      } else {
        addPartAnalysis("Back", "Slight Adjustment Needed", 80, "Keep your back straight while turning your head.");
      }
    }

    // 4. Hands (Weight 20%)
    if (!isPartVisible(lWrist, rWrist)) {
      addPartAnalysis("Hands", "Not Visible", 0, "Hands are not visible.");
    } else {
      addPartAnalysis("Hands", "Correct", 100, "Hands are resting correctly on thighs.");
    }

    // 5. Legs (Weight 15%)
    if (!isPartVisible(lKnee, rKnee)) {
      addPartAnalysis("Legs", "Not Visible", 0, "Legs are not visible.");
    } else {
      addPartAnalysis("Legs", "Correct", 100, "Sitting leg position is stable.");
    }

    // 6. Feet (Weight 15%)
    if (!isPartVisible(lAnkle, rAnkle)) {
      addPartAnalysis("Feet", "Not Visible", 0, "Feet are not visible.");
    } else {
      addPartAnalysis("Feet", "Correct", 100, "Feet are in correct sitting resting position.");
    }

    // 7. Alignment (Weight 10%)
    addPartAnalysis("Alignment", "Correct", 100, "Alignment is correct.");
  }
  
  // Fallback defaults
  else {
    addPartAnalysis("Head", "Correct", 100, "Head position is correct.");
    addPartAnalysis("Shoulders", "Correct", 100, "Shoulder posture is correct.");
    addPartAnalysis("Back", "Correct", 100, "Back posture is correct.");
    addPartAnalysis("Hands", "Correct", 100, "Hand alignment is correct.");
    addPartAnalysis("Legs", "Correct", 100, "Leg posture is correct.");
    addPartAnalysis("Feet", "Correct", 100, "Feet positioning is correct.");
    addPartAnalysis("Alignment", "Correct", 100, "Overall alignment is correct.");
  }

  // Calculate Weighted Score
  // Weights: Head 10, Shoulders 10, Back 20, Hands 20, Legs 15, Feet 15, Alignment 10
  const weights = {
    "Head": 0.10,
    "Shoulders": 0.10,
    "Back": 0.20,
    "Hands": 0.20,
    "Legs": 0.15,
    "Feet": 0.15,
    "Alignment": 0.10
  };

  let totalScore = 0;
  let visibleWeightsSum = 0;

  bodyAnalysis.forEach(part => {
    const weight = weights[part.bodyPart] || 0;
    if (part.status !== "Not Visible") {
      totalScore += part.score * weight;
      visibleWeightsSum += weight;
    }
  });

  const overallScore = visibleWeightsSum > 0 ? Math.round(totalScore / visibleWeightsSum) : 0;

  // Set severity level and status
  let status = "Needs Improvement";
  let severity = "Orange";
  if (overallScore >= 95) {
    status = "Excellent";
    severity = "Green";
  } else if (overallScore >= 80) {
    status = "Good";
    severity = "Yellow";
  } else if (overallScore >= 60) {
    status = "Fair";
    severity = "Orange";
  } else {
    status = "Incorrect";
    severity = "Red";
  }

  // Compile strengths and corrections list
  const strengths = [];
  const corrections = [];

  bodyAnalysis.forEach(part => {
    if (part.status === "Correct") {
      strengths.push(part.bodyPart + " is correct: " + part.feedback);
    } else if (part.status === "Slight Adjustment Needed" || part.status === "Incorrect") {
      corrections.push(part.feedback);
    }
  });

  const displayCorrections = corrections.slice(0, 3);
  const displayStrengths = strengths.length > 0 ? strengths.slice(0, 2) : ["Stable body base"];

  // Voice guide generation (Encouraging supportive teacher style)
  let voiceGuide = "";
  const postureName = targetPose.charAt(0).toUpperCase() + targetPose.slice(1);
  
  if (overallScore >= 95) {
    voiceGuide = `Excellent ${postureName}. Your posture closely matches the ideal position. Maintain this posture.`;
  } else {
    voiceGuide = "Great attempt. Let's make a few small adjustments: ";
    if (displayCorrections.length > 0) {
      voiceGuide += displayCorrections.join(" And ");
    } else {
      voiceGuide += "Keep holding your balance.";
    }
  }

  const nextCheck = overallScore >= 95 
    ? "Maintain this posture." 
    : "Adjust your position and let's check again in two seconds.";

  return {
    posture: postureName,
    overallScore,
    status,
    severity,
    bodyAnalysis,
    strengths: displayStrengths,
    corrections: displayCorrections,
    voiceGuide,
    nextCheck
  };
};
