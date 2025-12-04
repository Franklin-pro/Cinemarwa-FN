import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Lock,
  Loader,
  AlertCircle,
  CheckCircle,
  Play,
  ArrowLeft,
  Clock,
  Download,
  X,
  RefreshCw,
} from "lucide-react";
import { moviesAPI } from "../services/api/movies";
import { paymentsService } from "../services/api/payments";

/**
 * Redesigned Payment Page with MTN MoMo Status Verification
 * - Polls payment status after initiation
 * - Shows real-time payment confirmation
 * - Handles all MoMo states: PENDING, SUCCESSFUL, FAILED
 * - Automatically authorizes access on successful payment
 */

function formatCurrency(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `$${Number(amount || 0).toFixed(2)}`;
  }
}

export default function Payment() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth || {});

  // Steps: choose -> confirm -> processing -> verifying -> success/failed
  const [step, setStep] = useState(searchParams.get("type") ? "confirm" : "choose");
  const [paymentType, setPaymentType] = useState(searchParams.get("type") || "watch");
  const [movie, setMovie] = useState(null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState(null);

  // Form
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Transaction tracking
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // PENDING, SUCCESSFUL, FAILED
  const [statusMessage, setStatusMessage] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 30; // Poll for up to 5 minutes (30 * 10 seconds)


  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const totalSeconds = parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h : ${minutes}m : ${secs}s` : `${hours}h`;
    } 
    if (minutes > 0) {
      return secs > 0 ? `${minutes}m : ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
  };
  // Fetch movie
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setMovieLoading(true);
        const res = await moviesAPI.getMovieById(movieId);
        if (!mounted) return;
        setMovie(res.data.data);
      } catch (err) {
        console.error("Fetch movie error:", err);
        if (mounted) setMovieError("Could not load movie. Try again later.");
      } finally {
        if (mounted) setMovieLoading(false);
      }
    }
    if (movieId) load();
    return () => (mounted = false);
  }, [movieId]);

  // Poll payment status after initiation
  useEffect(() => {
    if (!transactionId || step !== "verifying") return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentsService.checkMoMoPaymentStatus(transactionId);
        const status = res.data.data.payment.paymentStatus; // PENDING, SUCCESSFUL, FAILED

        if (status === "SUCCESSFUL") {
          clearInterval(pollInterval);
          setPaymentStatus("SUCCESSFUL");
          setStatusMessage("Payment confirmed! Granting access...");
          setStep("success");
          
          // Navigate to success page after brief delay
          setTimeout(() => {
            navigate(`/payment-success/${transactionId}`);
          }, 2000);
        } else if (status === "FAILED") {
          clearInterval(pollInterval);
          setPaymentStatus("FAILED");
          const reason = res.data.data.reason || "Payment was declined";
          setStatusMessage(reason);
          setFormError(reason);
          setStep("failed");
        } else if (status === "PENDING") {
          setStatusMessage("Waiting for payment confirmation...");
          setPollCount((prev) => prev + 1);
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setPaymentStatus("TIMEOUT");
          setStatusMessage("Payment verification timeout. Please check your transaction history.");
          setFormError("Payment is taking longer than expected. Your transaction may still process.");
          setStep("failed");
        }
      } catch (err) {
        console.error("Status check error:", err);
        if (pollCount >= 5) { // Give up after 5 failed checks
          clearInterval(pollInterval);
          setFormError("Unable to verify payment status. Please contact support.");
          setStep("failed");
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [transactionId, step, pollCount, navigate]);

  // pricing
  const moviePrice = {
    watch:
      movie?.viewPrice !== undefined && movie?.viewPrice !== null
        ? Number(movie.viewPrice)
        : movie?.price
        ? Number(movie.price) * 0.8
        : 2.99,
    download:
      movie?.downloadPrice !== undefined && movie?.downloadPrice !== null
        ? Number(movie.downloadPrice)
        : movie?.price
        ? Number(movie.price)
        : 4.99,
  };
  const currency = movie?.currency || "RWF";

  // validation
  const validatePhone = (p) => {
    const cleaned = (p || "").replace(/\s/g, "");
    if (!cleaned) return "Phone number is required";
    // Rwanda format: +250 followed by 9 digits OR 07XX... (10 digits)
    if (/^\+?250\d{9}$/.test(cleaned)) return null;
    if (/^07\d{8}$/.test(cleaned)) return null;
    return "Please enter a valid phone number (e.g., +250788123456 or 0788123456)";
  };

  const handleStartPayment = (type) => {
    setPaymentType(type);
    setStep("confirm");
    setFormError("");
    setPaymentStatus(null);
    setStatusMessage("");
  };

  const doMoMoPayment = async (e) => {
    e?.preventDefault();
    setFormError("");
    setPaymentStatus(null);
    setStatusMessage("");

    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setFormError(phoneErr);
      return;
    }

    try {
      setProcessing(true);
      setStep("processing");

      // Calculate amounts: 95% to filmmaker, 5% to admin
      const totalAmount = moviePrice[paymentType];
      const filmmakersAmount = (totalAmount * 70) / 100;
      const adminAmount = (totalAmount * 30) / 100;

      // Format phone number for Rwanda
      let formattedPhone = phone.replace(/\s/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "0" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "0" + formattedPhone;
      }

      // Prepare payload
      const payload = {
        movieId,
        type: paymentType,
      amount: String(totalAmount), 
        filmmakersAmount,
        adminAmount,
        phoneNumber: formattedPhone,
        userId: user?.id,
        currency: currency,
      };


      const res = await paymentsService.processMoMoPayment(payload);

      if (res?.data?.data?.success && res.data.data.transactionId) {
        // Payment request accepted - now verify status
        setTransactionId(res.data.data.transactionId);
        setProcessing(false);
        setStep("verifying");
        setStatusMessage("Payment request sent. Please approve on your phone...");
        setPollCount(0);
      } else {
        setProcessing(false);
        setStep("confirm");
        setFormError(res?.data?.message || "Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("MoMo error:", err);
      setProcessing(false);
      setStep("confirm");
      const errorMsg = err.response?.data?.message || err.message || "Payment processing failed. Please try again.";
      setFormError(errorMsg);
    }
  };

  const retryPayment = () => {
    setStep("confirm");
    setFormError("");
    setPaymentStatus(null);
    setStatusMessage("");
    setTransactionId(null);
    setPollCount(0);
  };

  // UX small helpers
  const BackButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
      aria-label="Back"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 pt-24 pb-16">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Login required</h2>
          <p className="text-gray-300 mb-6">You need to be logged in to make a purchase.</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-black font-semibold py-2 rounded-lg"
            >
              Log in
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (movieLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 pt-24 pb-16">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-gray-400 mt-4">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (movieError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 pt-24 pb-16">
        <div className="max-w-lg w-full bg-gray-800 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Unable to load movie</h3>
          <p className="text-gray-300 mb-6">{movieError}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-700 text-white">
              Go Back
            </button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded bg-blue-500 text-black">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 pt-20 pb-8 md:pt-24 md:pb-16 md:min-h-screen md:flex md:items-center md:justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left: Movie preview + steps */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => navigate(`/movie/${movieId}`)} />
            <div className="text-sm text-gray-400">Secure · Encrypted · MTN MoMo</div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Hero preview */}
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-3/5 p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-6 flex-col md:flex-row">
                  {/* poster */}
                  <div className="w-24 h-36 md:w-32 md:h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 mx-auto md:mx-0">
                    <img
                      src={
                        movie?.poster?.startsWith?.("http")
                          ? movie.poster
                          : movie?.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : ""
                      }
                      alt={movie?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="w-full text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-white">{movie?.title}</h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-2 line-clamp-2 md:line-clamp-3">{movie?.overview}</p>

                    <div className="mt-4 flex items-center gap-2 justify-center md:justify-start flex-wrap">
                      <span className="inline-flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-lg text-xs text-gray-300">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" /> {formatDuration(movie.videoDuration || movie.runtime)}
                      </span>
                      <span className="inline-flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-lg text-xs text-gray-300">
                        {movie?.language || "en"}
                      </span>
                    </div>

                    {step === "choose" && (
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPaymentType((p) => (p === "watch" ? "download" : "watch"));
                            setStep("confirm");
                          }}
                          className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-200"
                        >
                          Switch to {paymentType === "watch" ? "Download" : "Watch"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper / controls */}
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center md:justify-start">
                        {/* Step pills */}
                        <div
                          className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs ${
                            step === "choose" ? "bg-blue-500 text-black" : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold">1</span>
                          <span className="hidden sm:inline">Choose</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs ${
                            step === "confirm" ? "bg-blue-500 text-black" : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold">2</span>
                          <span className="hidden sm:inline">Confirm</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs ${
                            step === "processing" ? "bg-blue-500 text-black" : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold">3</span>
                          <span className="hidden sm:inline">Processing</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs ${
                            step === "verifying" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold">4</span>
                          <span className="hidden sm:inline">Verifying</span>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs ${
                            step === "success" ? "bg-green-500 text-black" : step === "failed" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold">✓</span>
                          <span className="hidden sm:inline">Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Price quick */}
                    <div className="text-center md:text-right w-full md:w-auto">
                      <div className="text-xs text-gray-400">Total</div>
                      <div className="text-lg md:text-xl font-bold text-blue-400">
                        {formatCurrency(moviePrice[paymentType], currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Payment box / form */}
              <div className="w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-800 p-4 md:p-6 bg-gradient-to-b from-gray-900/90 to-gray-900/70">
                {/* Choose mode */}
                {step === "choose" && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-white font-semibold">Choose access</h3>

                    <div className="grid gap-3">
                      <button
                        onClick={() => handleStartPayment("watch")}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-700 rounded-md">
                            <Play className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-white">Watch — 48 hours</div>
                            <div className="text-xs text-gray-400">Stream from any device</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-blue-400">
                          {formatCurrency(moviePrice.watch, currency)}
                        </div>
                      </button>

                      <button
                        onClick={() => handleStartPayment("download")}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-700 rounded-md">
                            <Download className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-white">Download — Keep forever</div>
                            <div className="text-xs text-gray-400">30 day refund window</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-blue-400">
                          {formatCurrency(moviePrice.download, currency)}
                        </div>
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      Payments are processed via MTN Mobile Money. By proceeding you authorize the charge to your MoMo account.
                    </div>
                  </div>
                )}

                {/* Confirm / MoMo form */}
                {step === "confirm" && (
                  <form onSubmit={doMoMoPayment} className="space-y-3 md:space-y-4">
                    <h3 className="text-lg md:text-xl text-white font-semibold">Confirm & Pay</h3>

                    <div className="text-sm text-gray-100 mb-1">Item</div>
                    <div className="bg-gray-100 rounded-md p-3 text-sm">
                      <div className="flex justify-between">
                        <div>{paymentType === "watch" ? "Watch — 48 hours" : "Download — Keep forever"}</div>
                        <div className="font-semibold">{formatCurrency(moviePrice[paymentType], currency)}</div>
                      </div>
                    </div>

                    {/* phone input */}
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">MTN Mobile Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+250788123456 or 0788123456"
                        className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-800 border text-white text-sm md:text-base ${
                          formError ? "border-blue-500 focus:border-blue-500" : "border-gray-700 focus:border-blue-400"
                        } focus:outline-none transition`}
                        disabled={processing}
                      />
                      {formError && (
                        <p className="mt-2 text-xs text-blue-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {formError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 md:py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-black font-semibold disabled:opacity-50 text-sm md:text-base transition"
                      >
                        {processing ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" /> Pay {formatCurrency(moviePrice[paymentType], currency)}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStep("choose");
                          setFormError("");
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 md:py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 text-sm md:text-base transition"
                        disabled={processing}
                      >
                        <X className="w-4 h-4" /> Change selection
                      </button>
                    </div>

                    <div className="pt-3 text-xs text-gray-400">
                      <Lock className="inline-block w-4 h-4 mr-1" /> You will receive a USSD prompt on your phone to approve the payment.
                    </div>
                  </form>
                )}

                {/* Processing */}
                {step === "processing" && (
                  <div className="flex flex-col items-center justify-center gap-4 py-6 md:py-8">
                    <div className="inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-full bg-gray-800">
                      <Loader className="w-6 md:w-8 h-6 md:h-8 animate-spin text-blue-400" />
                    </div>
                    <div className="text-white font-semibold text-sm md:text-base">Initiating payment</div>
                    <div className="text-xs md:text-sm text-gray-400 text-center">Please wait while we process your request...</div>
                  </div>
                )}

                {/* Verifying */}
                {step === "verifying" && (
                  <div className="flex flex-col items-center justify-center gap-3 md:gap-4 py-6 md:py-8">
                    <div className="inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-full bg-blue-500">
                      <RefreshCw className="w-6 md:w-8 h-6 md:h-8 animate-spin text-white" />
                    </div>
                    <div className="text-white font-semibold text-sm md:text-base">Verifying payment</div>
                    <div className="text-xs md:text-sm text-gray-300 text-center">{statusMessage}</div>
                    <div className="text-xs text-gray-400 text-center">
                      Check #{pollCount + 1} of {maxPolls}
                    </div>
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-900/30 border border-blue-700 rounded-lg w-full">
                      <p className="text-xs text-gray-300 text-center">
                        <strong>On your phone:</strong><br />
                        1. Check for USSD prompt (*182*8*1#)<br />
                        2. Enter your MTN MoMo PIN<br />
                        3. Confirm the transaction
                      </p>
                    </div>
                  </div>
                )}

                {/* Success */}
                {step === "success" && (
                  <div className="space-y-3 text-center py-6 md:py-8">
                    <div className="mx-auto inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-full bg-green-500">
                      <CheckCircle className="w-6 md:w-8 h-6 md:h-8 text-black" />
                    </div>
                    <div className="text-white font-semibold text-sm md:text-base">Payment successful!</div>
                    <div className="text-xs md:text-sm text-gray-300">{statusMessage}</div>
                    <div className="text-xs text-gray-400">Transaction ID: {transactionId}</div>
                    <div className="pt-4 flex gap-2 flex-col md:flex-row">
                      <button
                        onClick={() => navigate(`/payment-success/${transactionId}`)}
                        className="flex-1 bg-blue-500 py-2 md:py-3 rounded-lg font-semibold hover:bg-blue-600 text-sm md:text-base"
                      >
                        View Receipt
                      </button>
                      <button
                        onClick={() => navigate(`/movie/${movieId}`)}
                        className="flex-1 bg-green-600 py-2 md:py-3 rounded-lg text-white hover:bg-green-700 text-sm md:text-base"
                      >
                        {paymentType === "watch" ? "Watch Now" : "Download"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Failed */}
                {step === "failed" && (
                  <div className="space-y-3 text-center py-6 md:py-8">
                    <div className="mx-auto inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-full bg-blue-500">
                      <X className="w-6 md:w-8 h-6 md:h-8 text-white" />
                    </div>
                    <div className="text-white font-semibold text-sm md:text-base">Payment failed</div>
                    <div className="text-xs md:text-sm text-gray-300">{statusMessage || formError}</div>
                    {transactionId && (
                      <div className="text-xs text-gray-400">Transaction ID: {transactionId}</div>
                    )}
                    <div className="pt-4 flex gap-2 flex-col md:flex-row">
                      <button
                        onClick={retryPayment}
                        className="flex-1 bg-blue-500 py-2 md:py-3 rounded-lg font-semibold hover:bg-blue-600 text-sm md:text-base"
                      >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Try Again
                      </button>
                      <button
                        onClick={() => navigate(`/movie/${movieId}`)}
                        className="flex-1 bg-gray-700 py-2 md:py-3 rounded-lg text-white hover:bg-gray-600 text-sm md:text-base"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order summary card */}
        <aside className="hidden lg:block bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-lg h-fit">
          <div className="flex items-start gap-4">
            <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
              <img
                src={
                  movie?.poster?.startsWith?.("http")
                    ? movie.poster
                    : movie?.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : ""
                }
                alt={movie?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h4 className="text-white font-semibold">{movie?.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-3">{movie?.overview}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-800 pt-4 space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <strong>{formatCurrency(moviePrice[paymentType], currency)}</strong>
            </div>

            <div className="flex justify-between text-gray-400 text-sm">
              <span>Tax</span>
              <span>{formatCurrency(0, currency)}</span>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-400">Total</div>
                <div className="text-lg font-bold text-blue-400">{formatCurrency(moviePrice[paymentType], currency)}</div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>Payment method</div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-800 text-white">
                  <CreditCard className="w-4 h-4" /> MTN MoMo
                </div>
              </div>
            </div>

            {transactionId && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Transaction ID</div>
                <div className="text-xs text-white font-mono break-all">{transactionId}</div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Payments are encrypted and processed by MTN Mobile Money. Do not share your PIN with anyone.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}