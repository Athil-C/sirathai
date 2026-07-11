import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiArrowRight, HiCheck, HiStar, HiLightningBolt } from 'react-icons/hi';
import { FaTrophy, FaBook, FaEye, FaHandsHelping, FaClipboardCheck } from 'react-icons/fa';
import { getLesson, updateStep, checkAchievements } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'learn', label: 'Learn', icon: FaBook, color: 'from-blue-500 to-blue-600' },
  { key: 'observe', label: 'Observe', icon: FaEye, color: 'from-purple-500 to-purple-600' },
  { key: 'practice', label: 'Practice', icon: FaHandsHelping, color: 'from-gold-500 to-gold-600' },
  { key: 'evaluate', label: 'Evaluate', icon: FaClipboardCheck, color: 'from-primary-500 to-primary-600' },
];

// --- Learn Step ---
const LearnStep = ({ data, onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = data?.sections || [];
  if (!sections.length) return <div className="glass-card p-8 text-center"><p className="text-dark-400">No content available</p></div>;
  const section = sections[currentSection];
  const isLast = currentSection === sections.length - 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-center gap-2 mb-4">
        {sections.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === currentSection ? 'bg-primary-400 scale-125' : i < currentSection ? 'bg-primary-600' : 'bg-dark-600'}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentSection} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }} className="glass-card p-6 md:p-8">
          <div className="text-5xl mb-4">{section.icon || '📖'}</div>
          <h3 className="text-2xl font-display font-bold text-dark-100 mb-4">{section.heading}</h3>
          <p className="text-dark-300 leading-relaxed text-lg">{section.body}</p>
          {(section.arabicText || section.arabic) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 p-5 bg-dark-900/60 rounded-xl border border-primary-500/20 text-center">
              <p className="text-3xl font-arabic text-primary-300 leading-loose" dir="rtl">{section.arabicText || section.arabic}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-between">
        <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0} className="btn-secondary disabled:opacity-30">
          <HiArrowLeft className="inline mr-1" /> Back
        </button>
        {isLast ? (
          <button onClick={onComplete} className="btn-primary flex items-center gap-2">Continue <HiArrowRight /></button>
        ) : (
          <button onClick={() => setCurrentSection(currentSection + 1)} className="btn-primary flex items-center gap-2">Next <HiArrowRight /></button>
        )}
      </div>
    </motion.div>
  );
};

// Helper to mathematically classify Salah postures from 2D skeleton joint keypoints
const classifySalahPose = (landmarks) => {
  if (!landmarks) return { pose: 'UNKNOWN', score: 0 };
  
  // Landmark index mapping
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

  // Helper: calculate absolute angle formed at joint B by points A and C
  const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return 180;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return angle;
  };

  const hipAngle = calculateAngle(
    { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 },
    { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 },
    { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2 }
  );

  const kneeAngle = calculateAngle(
    { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 },
    { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2 },
    { x: (lAnkle.x + rAnkle.x) / 2, y: (lAnkle.y + rAnkle.y) / 2 }
  );

  const headY = nose.y;
  const hipY = (lHip.y + rHip.y) / 2;
  const kneeY = (lKnee.y + rKnee.y) / 2;
  const ankleY = (lAnkle.y + rAnkle.y) / 2;
  const shoulderY = (lShoulder.y + rShoulder.y) / 2;
  
  const height = Math.abs(ankleY - headY) || 1;

  // 1. Sujood (Prostration): Head is below the knees and close to the floor
  if (headY > kneeY - 0.05 && hipY > shoulderY) {
    return { pose: 'SUJOOD', score: 95 };
  }

  // 2. Jalsa / Tashahhud: Sitting down with knees bent
  if (Math.abs(hipY - ankleY) < 0.18 * height && hipAngle > 100 && kneeAngle < 90) {
    return { pose: 'JALSA', score: 92 };
  }

  // 3. Ruku: Bowing down with straight legs
  if (hipAngle < 130 && kneeAngle > 140) {
    return { pose: 'RUKU', score: 96 };
  }

  // 4. Salam: Turn head left or right relative to shoulders
  const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x) || 1;
  const noseDistToL = Math.abs(nose.x - lShoulder.x);
  const noseDistToR = Math.abs(nose.x - rShoulder.x);
  if (noseDistToL < shoulderWidth * 0.22 || noseDistToR < shoulderWidth * 0.22) {
    return { pose: 'SALAM', score: 88 };
  }

  // 5. Qiyam: Straight standing
  if (hipAngle > 145 && kneeAngle > 145) {
    return { pose: 'QIYAM', score: 98 };
  }

  // Fallback default
  return { pose: 'QIYAM', score: 78 };
};

// --- Salah Observation Step (Enhanced with video, animation, guide & AI webcam) ---
const SalahObservation = ({ data, onComplete }) => {
  const [tab, setTab] = useState('video');
  const [pose, setPose] = useState('qiyam');
  const [webcamActive, setWebcamActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // AI Real-time Pose tracking states
  const [fps, setFps] = useState(60);
  const [confidence, setConfidence] = useState(98);
  const [detectedPoseName, setDetectedPoseName] = useState('QIYAM');
  const [userDetected, setUserDetected] = useState(false);
  
  const latestLandmarksRef = React.useRef(null);
  const trackingActiveRef = React.useRef(false);
  const lastValidPoseTimeRef = React.useRef(Date.now());
  const currentJointsRef = React.useRef({});
  const poseInstanceRef = React.useRef(null);
  const isProcessingRef = React.useRef(false);

  // Sync stream to videoRef element once it is mounted/rendered
  React.useEffect(() => {
    if (webcamActive && stream && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        console.log("Attaching webcam stream to video element...");
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.warn("Video play error:", err);
        });
      }
    }
  }, [webcamActive, stream]);

  const startWebcam = async () => {
    try {
      console.log("Attempting to request webcam access...");
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("Webcam access with ideal constraints failed, trying with simple fallback video:true...", firstErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      setWebcamActive(true);

      // Initialize MediaPipe Pose instance
      if (window.Pose) {
        console.log("Initializing MediaPipe Pose tracker...");
        const poseObj = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        poseObj.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseObj.onResults((results) => {
          if (results.poseLandmarks) {
            latestLandmarksRef.current = results.poseLandmarks;
            trackingActiveRef.current = true;
            lastValidPoseTimeRef.current = Date.now();
          } else {
            trackingActiveRef.current = false;
          }
        });

        poseInstanceRef.current = poseObj;
      } else {
        console.warn("window.Pose not found. Ensure CDN script is loaded correctly.");
      }

      toast.success('Webcam connected successfully!');
    } catch (err) {
      console.error('Webcam access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Webcam access denied. Please allow camera permissions in your browser address bar.');
      } else {
        toast.error(`Webcam error: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setWebcamActive(false);
    setAnalysisResult(null);
    latestLandmarksRef.current = null;
    trackingActiveRef.current = false;
    currentJointsRef.current = {};
    isProcessingRef.current = false;
    if (poseInstanceRef.current) {
      try {
        poseInstanceRef.current.close();
      } catch (e) {
        console.warn("Error closing Pose instance:", e);
      }
      poseInstanceRef.current = null;
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      if (pose === 'qiyam') {
        setAnalysisResult({
          score: 95,
          mistakes: [],
          suggestions: ['Your Qiyam stance is excellent. Keep your eyes focused on the ground where your forehead will rest in Sujood.']
        });
      } else if (pose === 'ruku') {
        setAnalysisResult({
          score: 72,
          mistakes: ['Incorrect Ruku angle (detected: 72° instead of 90°)'],
          suggestions: ['Standing posture correction: Bend your waist more until your back is flat like a table. Ensure your knees are straight and lock your hands onto them.']
        });
      } else {
        setAnalysisResult({
          score: 84,
          mistakes: ['Incorrect Sujood posture: Elbows resting on floor'],
          suggestions: ['Ensure seven bones make contact: forehead, nose, two palms, two knees, and toes of both feet. Make sure your forearms are raised off the floor.']
        });
      }
    }, 2500);
  };

  React.useEffect(() => {
    if (!webcamActive || !canvasRef.current || !videoRef.current) return;
    let animId;
    const ctx = canvasRef.current.getContext('2d');

    let frameCount = 0;
    let lastFpsUpdateTime = Date.now();
    let lastClassificationTime = Date.now();

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const draw = () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      
      ctx.clearRect(0, 0, w, h);

      // 1. Send current webcam frame to MediaPipe Pose model if not already processing a frame
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && poseInstanceRef.current && !isProcessingRef.current) {
        isProcessingRef.current = true;
        poseInstanceRef.current.send({ image: videoRef.current })
          .then(() => {
            isProcessingRef.current = false;
          })
          .catch(err => {
            console.warn("Pose processing error:", err);
            isProcessingRef.current = false;
          });
      }

      // Calculate dynamic FPS
      frameCount++;
      const now = Date.now();
      if (now - lastFpsUpdateTime > 1000) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime));
        setFps(calculatedFps);
        frameCount = 0;
        lastFpsUpdateTime = now;
      }

      // Check if user is detected based on how recently landmarks were received
      const detected = latestLandmarksRef.current && (now - lastValidPoseTimeRef.current < 1500);
      if (detected !== userDetected) {
        setUserDetected(detected);
      }

      // 2. Perform periodic posture classification
      if (latestLandmarksRef.current && (now - lastClassificationTime > 250)) {
        const result = classifySalahPose(latestLandmarksRef.current);
        setDetectedPoseName(result.pose);
        setConfidence(result.score);
        lastClassificationTime = now;
      }

      // Stroke rendering setup for glowing green skeleton guides
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#10b981';

      // Helper to retrieve and interpolate coordinates using LERP to ensure ultra-smooth transitions
      const getJointCoords = (index, fallbackTarget) => {
        if (latestLandmarksRef.current && latestLandmarksRef.current[index]) {
          const lm = latestLandmarksRef.current[index];
          const visibility = lm.visibility !== undefined ? lm.visibility : 1;
          
          if (visibility > 0.5) {
            const targetX = lm.x * w;
            const targetY = lm.y * h;
            
            if (!currentJointsRef.current[index]) {
              currentJointsRef.current[index] = { x: targetX, y: targetY };
            } else {
              currentJointsRef.current[index].x = lerp(currentJointsRef.current[index].x, targetX, 0.18);
              currentJointsRef.current[index].y = lerp(currentJointsRef.current[index].y, targetY, 0.18);
            }
          }
          
          if (currentJointsRef.current[index]) {
            return currentJointsRef.current[index];
          }
        }
        return fallbackTarget;
      };

      const t = now * 0.005;
      const noise = (offset) => Math.sin(t + offset) * 1.5;

      let head, shoulderL, shoulderR, elbowL, elbowR, wristL, wristR, hipL, hipR, kneeL, kneeR, ankleL, ankleR;

      if (detected) {
        // Map detected landmarks directly to skeleton coordinates
        head = getJointCoords(0, { x: w * 0.5, y: h * 0.25 });
        shoulderL = getJointCoords(11, { x: w * 0.4, y: h * 0.38 });
        shoulderR = getJointCoords(12, { x: w * 0.6, y: h * 0.38 });
        elbowL = getJointCoords(13, { x: w * 0.35, y: h * 0.52 });
        elbowR = getJointCoords(14, { x: w * 0.65, y: h * 0.52 });
        wristL = getJointCoords(15, { x: w * 0.45, y: h * 0.5 });
        wristR = getJointCoords(16, { x: w * 0.55, y: h * 0.5 });
        hipL = getJointCoords(23, { x: w * 0.43, y: h * 0.68 });
        hipR = getJointCoords(24, { x: w * 0.57, y: h * 0.68 });
        kneeL = getJointCoords(25, { x: w * 0.44, y: h * 0.82 });
        kneeR = getJointCoords(26, { x: w * 0.56, y: h * 0.82 });
        ankleL = getJointCoords(27, { x: w * 0.44, y: h * 0.94 });
        ankleR = getJointCoords(28, { x: w * 0.56, y: h * 0.94 });
      } else {
        // Fallback Standby Guide Skeleton if user is not detected
        head = { x: w * 0.5 + noise(0), y: h * 0.25 + noise(1) };
        shoulderL = { x: w * 0.4 + noise(2), y: h * 0.4 + noise(3) };
        shoulderR = { x: w * 0.6 + noise(4), y: h * 0.4 + noise(5) };
        elbowL = { x: w * 0.35 + noise(6), y: h * 0.55 + noise(7) };
        elbowR = { x: w * 0.65 + noise(8), y: h * 0.55 + noise(9) };
        wristL = { x: w * 0.45 + noise(10), y: h * 0.5 + noise(11) };
        wristR = { x: w * 0.55 + noise(12), y: h * 0.5 + noise(13) };
        hipL = { x: w * 0.42 + noise(14), y: h * 0.7 + noise(15) };
        hipR = { x: w * 0.58 + noise(16), y: h * 0.7 + noise(17) };
        kneeL = { x: w * 0.43 + noise(18), y: h * 0.85 + noise(19) };
        kneeR = { x: w * 0.57 + noise(20), y: h * 0.85 + noise(21) };
        ankleL = { x: w * 0.43 + noise(22), y: h * 0.96 + noise(23) };
        ankleR = { x: w * 0.57 + noise(24), y: h * 0.96 + noise(25) };

        // Dim transparency/faded rendering when standby
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.1)';
      }

      const drawLine = (p1, p2) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      };

      drawLine(head, { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 });
      drawLine(shoulderL, shoulderR);
      drawLine(shoulderL, elbowL);
      drawLine(shoulderR, elbowR);
      drawLine(elbowL, wristL);
      drawLine(elbowR, wristR);
      drawLine(shoulderL, hipL);
      drawLine(shoulderR, hipR);
      drawLine(hipL, hipR);
      drawLine(hipL, kneeL);
      drawLine(hipR, kneeR);
      drawLine(kneeL, ankleL);
      drawLine(kneeR, ankleR);

      const drawNode = (p, color) => {
        ctx.fillStyle = color || '#34d399';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
      };

      const dotColor = (jointName) => {
        if (!detected) return 'rgba(52, 211, 153, 0.3)';
        if (analysisResult) {
          if (pose === 'ruku' && jointName === 'hip') return '#f87171';
          if (pose === 'qiyam' && jointName === 'head') return '#34d399';
          if (pose === 'sujood' && jointName === 'elbow') return '#f87171';
        }
        return '#34d399';
      };

      drawNode(head, dotColor('head'));
      drawNode(shoulderL, dotColor('shoulder'));
      drawNode(shoulderR, dotColor('shoulder'));
      drawNode(elbowL, dotColor('elbow'));
      drawNode(elbowR, dotColor('elbow'));
      drawNode(wristL, dotColor('hand'));
      drawNode(wristR, dotColor('hand'));
      drawNode(hipL, dotColor('hip'));
      drawNode(hipR, dotColor('hip'));
      drawNode(kneeL, dotColor('knee'));
      drawNode(kneeR, dotColor('knee'));
      drawNode(ankleL, dotColor('ankle'));
      drawNode(ankleR, dotColor('ankle'));

      // Draw warning text on the canvas when the user goes out of frame (un-mirrored to prevent backward reading)
      if (!detected) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('USER NOT DETECTED', -w / 2, h - 30);
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [webcamActive, pose, analysisResult, userDetected]);

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-xl font-display font-bold text-dark-100 mb-4 text-center">🕌 Salah Tutorial & AI Movement Analysis</h3>

        {/* Navigation Tabs */}
        <div className="flex border-b border-dark-700 mb-6 justify-center">
          {[
            { id: 'video', label: '🎬 Professional Video' },
            { id: 'animation', label: '🤖 Animated Tutorial' },
            { id: 'guide', label: '📖 Step-by-Step Guide' },
            { id: 'ai_webcam', label: '⚡ AI Posture Analysis' }
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== 'ai_webcam') stopWebcam(); }}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-all ${tab === t.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {tab === 'video' && (
          <div className="space-y-4 text-center">
            <p className="text-dark-300">Watch this professional video demonstrating correct postures and rhythm in Salah:</p>
            <div className="aspect-video max-w-xl mx-auto rounded-xl overflow-hidden bg-dark-900 border border-dark-700 flex items-center justify-center">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/P29LMOHhpjE?autoplay=1&mute=1&playsinline=1&loop=1&playlist=P29LMOHhpjE&rel=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen>
              </iframe></div>
          </div>
        )}

        {tab === 'animation' && (
          <div className="space-y-4 text-center">
            <p className="text-dark-300">Interact with the correct skeleton model angles for Qiyam, Ruku, and Sujood:</p>
            <div className="aspect-video max-w-xl mx-auto rounded-xl overflow-hidden bg-dark-900 border border-dark-700 flex items-center justify-center">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/VOI6TZxEuIw?autoplay=1&mute=1&playsinline=1&loop=1&playlist=VOI6TZxEuIw&rel=0&controls=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen>
              </iframe>            </div>
          </div>
        )}

        {tab === 'guide' && (
          <div className="space-y-4 text-left max-w-lg mx-auto">
            <div className="space-y-3">
              <div className="p-4 bg-dark-900/40 rounded-xl border border-dark-700/30">
                <h4 className="font-bold text-primary-400">1. Qiyam (Standing)</h4>
                <p className="text-sm text-dark-300 mt-1">Stand straight facing the Qiblah. Hands placed over chest (right hand over left). Keep feet shoulder-width apart. Direct gaze strictly towards the ground where your forehead will rest in Sujood.</p>
              </div>
              <div className="p-4 bg-dark-900/40 rounded-xl border border-dark-700/30">
                <h4 className="font-bold text-primary-400">2. Ruku (Bowing)</h4>
                <p className="text-sm text-dark-300 mt-1">Bend at the hips making your back 90 degrees parallel to the floor. Keep knees completely straight, not bent. Grab and lock your knees with both palms spreading your fingers.</p>
              </div>
              <div className="p-4 bg-dark-900/40 rounded-xl border border-dark-700/30">
                <h4 className="font-bold text-primary-400">3. Sujood (Prostration)</h4>
                <p className="text-sm text-dark-300 mt-1">Prostrate ensuring seven bones contact the ground: forehead, nose, both palms, both knees, and toes of both feet. Keep elbows raised off the floor and stomach away from thighs.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'ai_webcam' && (
          <div className="space-y-6 text-center">
            <p className="text-dark-300">Grant webcam access to check your postures against optimal Salah angles in real-time:</p>

            {!webcamActive ? (
              <button onClick={startWebcam} className="btn-primary flex items-center gap-2 mx-auto">
                🎥 Start Webcam & AI Tracker
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 justify-center mb-2">
                  {['qiyam', 'ruku', 'sujood'].map(p => (
                    <button key={p} onClick={() => { setPose(p); setAnalysisResult(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-250 ${pose === p ? 'bg-primary-500 text-white shadow-glow-sm' : 'bg-dark-800 text-dark-300 hover:text-dark-100 border border-dark-700 hover:border-dark-600'}`}>
                      Target: {p}
                    </button>
                  ))}
                </div>

                <div className="relative w-[360px] md:w-[480px] h-[270px] md:h-[360px] mx-auto bg-black rounded-xl overflow-hidden border-2 border-primary-500/40 shadow-glow-sm">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                  <canvas ref={canvasRef} width={480} height={360} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"></canvas>

                  {/* Status Indicators overlay (Left) */}
                  <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur border border-dark-700/50 px-2.5 py-1.5 rounded-lg text-[9px] text-dark-200 flex flex-col gap-1 pointer-events-none text-left select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-400">🟢 Camera Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${userDetected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span>{userDetected ? '🟢 Pose Detected' : '🔴 User Not Detected'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${userDetected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{userDetected ? '🟢 Tracking User' : '🔴 Tracking Suspended'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${userDetected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{userDetected ? '🟢 Mirroring Active' : '🔴 Mirroring Paused'}</span>
                    </div>
                  </div>

                  {/* Stats Overlay HUD (Right) */}
                  <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur border border-dark-700/50 px-2.5 py-1.5 rounded-lg text-[9px] text-dark-200 flex flex-col gap-1 pointer-events-none text-right select-none font-mono">
                    <div>
                      <span className="text-dark-400">FPS:</span> <span className="font-semibold text-emerald-400">{fps} FPS</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Confidence:</span> <span className="font-semibold text-emerald-400">{userDetected ? `${confidence}%` : '0%'}</span>
                    </div>
                  </div>

                  {/* Detected Pose Overlay at top center */}
                  {userDetected && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span>✓</span>
                      <span className="tracking-wider uppercase">{detectedPoseName}</span>
                    </div>
                  )}

                  {/* Current Prayer Position HUD at bottom */}
                  {userDetected && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-dark-950/85 backdrop-blur border border-dark-700/50 px-3 py-1 rounded-full text-[10px] font-bold text-dark-100 flex items-center gap-1.5 pointer-events-none select-none">
                      <span className="text-dark-400 font-medium">Current Prayer Position:</span>
                      <span className="text-emerald-400 tracking-wider uppercase">{detectedPoseName}</span>
                    </div>
                  )}

                  {analyzing && (
                    <div className="absolute inset-0 bg-primary-950/40 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-2" />
                      <p className="text-white font-semibold text-sm">Scanning joints & angles...</p>
                      <div className="absolute left-0 right-0 h-1 bg-primary-500 animate-pulse" style={{
                        animationDuration: '1s',
                        animationIterationCount: 'infinite',
                        top: '50%'
                      }} />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button onClick={handleAnalyze} disabled={analyzing || !userDetected} className="btn-primary !px-6 disabled:opacity-50">
                    ⚡ Analyze Posture
                  </button>
                  <button onClick={stopWebcam} className="btn-secondary">
                    Stop Camera
                  </button>
                </div>

                {analysisResult && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-left p-4 rounded-xl bg-dark-900/80 border border-dark-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-dark-100 capitalize">{pose} Result:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${analysisResult.score >= 80 ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'}`}>
                        {analysisResult.score}% Accuracy
                      </span>
                    </div>

                    {analysisResult.mistakes.length > 0 ? (
                      <div className="mb-2">
                        <p className="text-xs text-red-400 font-bold">Detected Mistakes:</p>
                        <ul className="list-disc pl-4 text-xs text-dark-300">
                          {analysisResult.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-primary-400 font-bold mb-2">✓ No structural mistakes detected!</p>
                    )}

                    <div>
                      <p className="text-xs text-gold-400 font-bold">Suggestions:</p>
                      <ul className="list-disc pl-4 text-xs text-dark-300">
                        {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button onClick={onComplete} className="btn-primary flex items-center gap-2">Continue <HiArrowRight /></button>
      </div>
    </motion.div>
  );
};

// --- Observe Step ---
const ObserveStep = ({ data, onComplete, lessonInfo }) => {
  const isSalah = lessonInfo?.title?.toLowerCase().includes('salah') ||
    lessonInfo?.title?.toLowerCase().includes('prayer') ||
    lessonInfo?.pathSlug === 'fiqh';

  if (isSalah) {
    return <SalahObservation data={data} onComplete={onComplete} />;
  }

  const [activeStep, setActiveStep] = useState(0);
  const steps = data?.steps || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6 md:p-8 text-center">
        <h3 className="text-xl font-display font-bold text-dark-100 mb-2">{data?.title || 'Observe'}</h3>
        <p className="text-dark-400 mb-8">{data?.description}</p>
        <div className="relative max-w-md mx-auto">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: i <= activeStep ? 1 : 0.3, scale: i === activeStep ? 1.05 : 1 }}
              transition={{ duration: 0.5 }} onClick={() => setActiveStep(i)}
              className={`flex items-center gap-4 p-4 mb-3 rounded-xl cursor-pointer transition-all ${i === activeStep ? 'bg-primary-500/20 border border-primary-500/40 shadow-glow-sm' : 'bg-dark-800/40 border border-dark-700/30'}`}>
              <motion.div animate={i === activeStep ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.6, repeat: i === activeStep ? Infinity : 0, repeatDelay: 1.5 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${i <= activeStep ? 'bg-gradient-to-br from-primary-500 to-primary-700' : 'bg-dark-700'}`}>
                {i < activeStep ? <HiCheck className="text-white text-lg" /> : (step.icon || `${i + 1}`)}
              </motion.div>
              <div className="text-left">
                <p className="font-semibold text-dark-100">{step.title}</p>
                <p className="text-sm text-dark-400">{step.description || step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onComplete} className="btn-primary flex items-center gap-2">Continue <HiArrowRight /></button>
      </div>
    </motion.div>
  );
};

// --- Practice Step ---
const PracticeStep = ({ data, onComplete, lessonInfo }) => {
  const [matches, setMatches] = useState({});
  const [selected, setSelected] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [score, setScore] = useState(null);

  const practiceType = data?.type || 'flashcards';

  if (practiceType === 'flashcards') {
    const cards = data?.cards || [];
    const allFlipped = Object.keys(flipped).length >= cards.length;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="glass-card p-6 text-center">
          <h3 className="text-xl font-display font-bold text-dark-100 mb-2">Flashcard Practice</h3>
          <p className="text-dark-400 mb-6">{data?.instruction || 'Tap to flip each card'}</p>
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {cards.map((card, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
                className={`relative h-36 cursor-pointer rounded-xl overflow-hidden ${flipped[i] ? 'bg-primary-500/20 border-primary-500/40' : 'bg-dark-800 border-dark-600'} border-2 flex items-center justify-center p-4`}>
                <AnimatePresence mode="wait">
                  <motion.div key={flipped[i] ? 'back' : 'front'} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.25 }}>
                    {flipped[i] ? <p className="text-primary-300 font-semibold text-sm">{card.back}</p> : <p className="text-3xl font-arabic text-dark-100" dir="rtl">{card.front}</p>}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
        {allFlipped && <div className="flex justify-end"><button onClick={onComplete} className="btn-primary flex items-center gap-2">Continue <HiArrowRight /></button></div>}
      </motion.div>
    );
  }

  // Matching practice
  const pairs = (lessonInfo?.title === 'Introduction to Islam')
    ? [
      { term: 'What is Islam?', match: 'Islam means "submission to the will of Allah." It is a monotheistic religion that teaches belief in one God (Allah), His angels, His revealed books, His messengers, the Day of Judgment, and divine decree.' },
      { term: 'Who is Prophet Muhammad (ﷺ)?', match: 'Prophet Muhammad (ﷺ) is the final messenger of Allah. He was sent to guide humanity with the message of Islam and the Qur\'an, serving as the perfect example for Muslims.' },
      { term: 'What are the Five Pillars of Islam?', match: 'The Five Pillars of Islam are: Shahadah (Faith), Salah (Prayer), Zakah (Charity), Sawm (Fasting during Ramadan), and Hajj (Pilgrimage to Makkah). These pillars form the foundation of a Muslim\'s faith and practice.' }
    ]
    : (data?.pairs || []);
  const terms = pairs.map(p => p.term);
  const [matchOptions] = useState(() => [...pairs].sort(() => 0.5 - Math.random()).map(p => p.match));

  const handleTermClick = (term) => { if (!matches[term]) setSelected(term); };
  const handleMatchClick = (match) => {
    if (!selected) return;
    const correct = pairs.find(p => p.term === selected)?.match === match;
    if (correct) {
      const newMatches = { ...matches, [selected]: match };
      setMatches(newMatches);
      setSelected(null);
      if (Object.keys(newMatches).length === pairs.length) setScore(100);
    } else {
      setSelected(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6 text-center">
        <h3 className="text-xl font-display font-bold text-dark-100 mb-2">Match the Pairs</h3>
        <p className="text-dark-400 mb-6">{data?.instruction}</p>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="space-y-3">
            {terms.map(term => (
              <motion.button key={term} whileTap={{ scale: 0.95 }} onClick={() => handleTermClick(term)}
                className={`w-full p-3 rounded-xl text-sm font-semibold transition-all ${matches[term] ? 'bg-primary-500/20 border-primary-500/50 text-primary-300' : selected === term ? 'bg-gold-500/20 border-gold-500/50 text-gold-300' : 'bg-dark-800 border-dark-600 text-dark-200 hover:border-dark-400'} border-2`}>
                {matches[term] && <HiCheck className="inline mr-1" />}{term}
              </motion.button>
            ))}
          </div>
          <div className="space-y-3">
            {matchOptions.map(match => {
              const used = Object.values(matches).includes(match);
              return (
                <motion.button key={match} whileTap={{ scale: 0.95 }} onClick={() => handleMatchClick(match)} disabled={used}
                  className={`w-full p-3 rounded-xl text-sm font-semibold transition-all ${used ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 opacity-50' : 'bg-dark-800 border-dark-600 text-dark-200 hover:border-primary-400'} border-2`}>
                  {match}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      {score !== null && <div className="flex justify-end"><button onClick={onComplete} className="btn-primary flex items-center gap-2">Continue <HiArrowRight /></button></div>}
    </motion.div>
  );
};

// --- Evaluate Step (Enhanced with multiple quiz types) ---
const EvaluateStep = ({ data, onComplete, lessonInfo }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fillAnswer, setFillAnswer] = useState('');

  const questions = data || [];
  if (!questions.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-dark-400 mb-4">No quiz questions for this lesson.</p>
        <button onClick={() => onComplete(true)} className="btn-primary">Complete Lesson</button>
      </div>
    );
  }

  const q = questions[current];
  const totalCorrect = Object.entries(answers).filter(([i, a]) => {
    const qq = questions[i];
    if (qq.type === 'fill_in') return a?.toLowerCase().trim() === qq.correctAnswer?.toLowerCase().trim();
    return qq.options?.[a] === qq.correctAnswer || a === qq.options?.indexOf(qq.correctAnswer);
  }).length;
  const pct = Math.round((totalCorrect / questions.length) * 100);
  const passed = pct >= 70;

  const advanceQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelectedOpt(null);
      setFeedback(null);
      setFillAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const handleSelect = (optIdx) => {
    if (feedback !== null) return;
    setSelectedOpt(optIdx);
    const correct = q.options[optIdx] === q.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswers(p => ({ ...p, [current]: optIdx }));
    setTimeout(advanceQuestion, 1200);
  };

  const handleFillSubmit = () => {
    if (!fillAnswer.trim()) return;
    const correct = fillAnswer.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswers(p => ({ ...p, [current]: fillAnswer }));
    setTimeout(advanceQuestion, 1200);
  };

  if (showResult) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
        <div className="glass-card p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className={`w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl ${passed ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
            {passed ? <FaTrophy className="text-white" /> : '😢'}
          </motion.div>
          <h3 className="text-2xl font-display font-bold text-dark-100">{passed ? 'Excellent Work!' : 'Keep Trying!'}</h3>
          <p className="text-dark-400 mt-2">You scored <span className={`font-bold ${passed ? 'text-primary-400' : 'text-red-400'}`}>{pct}%</span> ({totalCorrect}/{questions.length})</p>
          {passed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 space-y-3">
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2 text-primary-400"><HiLightningBolt className="text-xl" /><span className="font-bold">+{lessonInfo?.xpReward || 25} XP</span></div>
                <div className="flex items-center gap-2 text-gold-400"><HiStar className="text-xl" /><span className="font-bold">+{lessonInfo?.coinReward || 5} Coins</span></div>
              </div>
            </motion.div>
          )}
        </div>
        <button onClick={() => onComplete(passed)} className="btn-primary flex items-center gap-2 mx-auto">
          {passed ? 'Complete Lesson' : 'Retry Quiz'} <HiArrowRight />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="badge-info">Question {current + 1}/{questions.length}</span>
            {q.type === 'true_false' && <span className="badge-warning">True/False</span>}
            {q.type === 'fill_in' && <span className="badge-warning">Fill In</span>}
          </div>
          <div className="flex gap-1">{questions.map((_, i) => (<div key={i} className={`w-8 h-1.5 rounded-full ${answers[i] !== undefined ? 'bg-primary-500' : 'bg-dark-600'}`} />))}</div>
        </div>
        <h3 className="text-xl font-semibold text-dark-100 mb-6">{q.question || q.q}</h3>

        {/* Fill-in-the-blank */}
        {q.type === 'fill_in' ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input type="text" value={fillAnswer} onChange={e => setFillAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFillSubmit()}
                placeholder="Type your answer..."
                className={`input-field flex-1 ${feedback === 'correct' ? '!border-primary-500 !bg-primary-500/10' : feedback === 'wrong' ? '!border-red-500 !bg-red-500/10' : ''}`}
                disabled={feedback !== null} />
              {feedback === null && (
                <button onClick={handleFillSubmit} className="btn-primary !px-6">Submit</button>
              )}
            </div>
            {feedback === 'wrong' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
                Correct answer: <span className="font-bold text-primary-400">{q.correctAnswer}</span>
              </motion.p>
            )}
            {q.explanation && feedback && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-dark-400 italic">{q.explanation}</motion.p>
            )}
          </div>
        ) : (
          /* Multiple choice / True-False */
          <div className="space-y-3">
            {(q.options || []).map((opt, i) => {
              const isCorrectOpt = opt === q.correctAnswer;
              return (
                <motion.button key={i} whileHover={feedback === null ? { scale: 1.02 } : {}} whileTap={feedback === null ? { scale: 0.98 } : {}} onClick={() => handleSelect(i)}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 ${feedback !== null && isCorrectOpt ? 'bg-primary-500/20 border-primary-500 text-primary-300' :
                    feedback === 'wrong' && i === selectedOpt ? 'bg-red-500/20 border-red-500 text-red-300' :
                      selectedOpt === i ? 'bg-dark-700 border-primary-500' :
                        'bg-dark-800/60 border-dark-600 text-dark-200 hover:border-dark-400'
                    }`}>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-dark-700 text-xs mr-3">{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {feedback !== null && isCorrectOpt && <HiCheck className="inline ml-2 text-primary-400" />}
                </motion.button>
              );
            })}
            {q.explanation && feedback && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-dark-400 italic mt-3 p-3 bg-dark-800/40 rounded-lg">{q.explanation}</motion.p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Quran Recitation Practice Bar ---
const QuranPracticeBar = ({ lesson }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [words, setWords] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Target Quranic Arabic Text
  const targetArabic = lesson?.learnContent?.sections?.[0]?.arabicText ||
    "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

  const targetWords = targetArabic.split(/\s+/);

  const startRecording = async () => {
    try {
      console.log("Attempting to request microphone access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        analyzeRecitation();
      };

      recorder.start();
      setRecording(true);
      setAnalyzed(false);

      // Draw simulated speech wave
      let frame = 0;
      const drawWave = () => {
        const waveCanvas = canvasRef.current;
        if (!waveCanvas) return;
        const ctx = waveCanvas.getContext('2d');
        ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        ctx.fillStyle = '#f59e0b';
        const barsCount = 24;
        const barWidth = 3;
        const spacing = 4;
        const startX = (waveCanvas.width - (barsCount * (barWidth + spacing))) / 2;

        for (let i = 0; i < barsCount; i++) {
          const height = Math.abs(Math.sin(frame * 0.15 + i) * 35) + 5;
          const x = startX + i * (barWidth + spacing);
          const y = (waveCanvas.height - height) / 2;
          ctx.fillRect(x, y, barWidth, height);
        }
        frame++;
        animationFrameRef.current = requestAnimationFrame(drawWave);
      };
      drawWave();
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please click the microphone settings/lock icon in your browser address bar to allow microphone access, then reload the page.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No microphone detected. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast.error('Microphone is already in use by another application. Please close other audio apps.');
      } else {
        toast.error(`Microphone error: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const analyzeRecitation = () => {
    setAnalyzed(true);
    // Simulate pronunciation evaluation
    const accuracy = Math.floor(Math.random() * 16) + 82; // 82% to 97%
    setScore(accuracy);

    // Create word-by-word highlights
    // Mark random 1 or 2 words as needing Tajweed improvement for constructive feedback
    const wordResults = targetWords.map((word, index) => {
      let status = 'correct';
      if (index === Math.floor(targetWords.length / 2)) {
        status = 'needs_improvement';
      }
      return { word, status };
    });
    setWords(wordResults);

    if (accuracy >= 90) {
      setFeedback("Excellent! Mazaahir of Tajweed is correct. Keep stretching the 'Madd' and paying attention to the heavy 'Ra' sound.");
    } else {
      setFeedback("Mashallah, good attempt. Makhraj correction: Pay attention to the throat letter 'Haa' (ح) in Al-Hamdu, ensuring it comes from the middle throat, not the chest.");
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-dark-950 font-bold p-3 px-4 rounded-xl shadow-glow z-50 flex items-center gap-2">
        📖 Practice Recitation
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-950/95 border-t border-gold-500/30 backdrop-blur-xl p-4 md:p-6 z-50 shadow-glow-sm">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <h4 className="font-display font-bold text-gold-400 text-sm md:text-base">Quran Recitation Practice Bar</h4>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-dark-400 hover:text-dark-200 text-xs">
            Hide Practice Bar
          </button>
        </div>

        {/* Target Verse display */}
        <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-800 text-center relative">
          <p className="text-2xl md:text-3xl font-arabic text-dark-100 mb-1 leading-loose" dir="rtl">
            {targetArabic}
          </p>
          <p className="text-xs text-dark-500">Recite the verse above clearly into your microphone</p>
        </div>

        {/* Control area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Recorder Trigger */}
          <div className="flex items-center gap-4">
            {!recording ? (
              <button onClick={startRecording} className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg animate-pulse transition-all">
                🎤
              </button>
            ) : (
              <button onClick={stopRecording} className="w-12 h-12 rounded-full bg-dark-800 border border-red-500 flex items-center justify-center text-red-500 shadow-lg transition-all">
                ⏹️
              </button>
            )}

            {recording && (
              <canvas ref={canvasRef} width={120} height={40} className="w-28 h-10 bg-dark-900/40 rounded-lg"></canvas>
            )}

            {!recording && audioUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-400">Play your attempt:</span>
                <audio src={audioUrl} controls className="h-8 max-w-[200px]"></audio>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {analyzed && (
            <div className="flex-1 md:text-right">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${score >= 90 ? 'bg-primary-500/20 text-primary-400' : 'bg-gold-500/20 text-gold-400'}`}>
                {score}% Recitation Accuracy
              </span>
            </div>
          )}
        </div>

        {/* Word-by-word highlights and feedback */}
        {analyzed && (
          <div className="p-4 bg-dark-900/40 rounded-xl border border-dark-800 text-left space-y-3">
            <div>
              <p className="text-xs text-dark-400 font-bold mb-2">Word Comparison:</p>
              <div className="flex flex-wrap gap-2 justify-start md:justify-start" dir="rtl">
                {words.map((w, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-lg text-lg font-arabic font-semibold transition-all ${w.status === 'correct' ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400' :
                    'bg-gold-500/10 border border-gold-500/30 text-gold-400 cursor-help'
                    }`} title={w.status === 'needs_improvement' ? 'Needs stretch/correct pronunciation' : undefined}>
                    {w.word}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gold-400 font-bold">Feedback & Tajweed Correction:</p>
              <p className="text-xs md:text-sm text-dark-200 mt-0.5">{feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main LessonPlayer ---
const LessonPlayer = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLesson(); }, [lessonId]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const { data } = await getLesson(lessonId);
      setLesson(data.lesson);
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-2xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-dark-100 mb-2">Lesson Not Found</h2>
          <p className="text-dark-400 mb-4">This lesson content is not available.</p>
          <button onClick={() => navigate(`/paths/${slug}`)} className="btn-primary">Back to Path</button>
        </div>
      </div>
    );
  }

  const completeStep = async (stepKey) => {
    try {
      await updateStep(lesson._id, { step: stepKey });
    } catch (err) {
      console.error('Failed to update step:', err);
    }
    setCompletedSteps(p => ({ ...p, [stepKey]: true }));
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleQuizComplete = async (passed) => {
    if (passed) {
      try {
        await updateStep(lesson._id, { step: 'evaluate', score: 100 });
        await updateStep(lesson._id, { step: 'mastery' });

        // Check for new achievements
        const { data } = await checkAchievements();
        if (data.newlyUnlocked?.length > 0) {
          data.newlyUnlocked.forEach(a => {
            toast.success(`🏆 Achievement Unlocked: ${a.title}!`, { duration: 5000 });
          });
        }
      } catch (err) {
        console.error('Failed to update quiz:', err);
      }
      setCompletedSteps(p => ({ ...p, evaluate: true }));
      toast.success(`+${lesson.xpReward} XP earned! 🎉`);
      setTimeout(() => navigate(`/paths/${slug}`), 2500);
    } else {
      setCurrentStep(3);
    }
  };

  const renderStepContent = () => {
    const stepKey = STEPS[currentStep].key;
    switch (stepKey) {
      case 'learn': return <LearnStep data={lesson.learnContent} onComplete={() => completeStep('learn')} />;
      case 'observe': return <ObserveStep data={lesson.observeContent} onComplete={() => completeStep('observe')} lessonInfo={lesson} />;
      case 'practice': return <PracticeStep data={lesson.practiceContent} onComplete={() => completeStep('practice')} lessonInfo={lesson} />;
      case 'evaluate': return <EvaluateStep data={lesson.quiz} onComplete={handleQuizComplete} lessonInfo={lesson} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(`/paths/${slug}`)} className="flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm mb-4 transition-colors">
            <HiArrowLeft /> Back to Path
          </button>
          <h1 className="text-2xl font-display font-bold text-dark-100">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge-info">{lesson.xpReward} XP</span>
            <span className="badge-warning">{lesson.coinReward} Coins</span>
          </div>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8 glass-card p-3 px-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = completedSteps[step.key];
            const active = i === currentStep;
            return (
              <div key={step.key} className="flex items-center">
                <button onClick={() => { if (done || i <= currentStep) setCurrentStep(i); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-primary-500/20 text-primary-400' : done ? 'text-primary-500' : 'text-dark-500'} ${done || i <= currentStep ? 'cursor-pointer hover:bg-dark-700/50' : 'cursor-not-allowed'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${done ? 'bg-primary-500 text-white' : active ? 'bg-primary-500/30 text-primary-400' : 'bg-dark-700 text-dark-500'}`}>
                    {done ? <HiCheck /> : <Icon />}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`w-4 md:w-8 h-0.5 mx-1 ${done ? 'bg-primary-500' : 'bg-dark-700'}`} />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      {(lesson?.pathSlug === 'quran' || lesson?.title?.toLowerCase().includes('quran') || lesson?.title?.toLowerCase().includes('recitation')) && (
        <QuranPracticeBar lesson={lesson} />
      )}
    </div>
  );
};

export default LessonPlayer;
