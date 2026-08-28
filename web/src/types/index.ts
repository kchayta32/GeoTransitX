export interface GcpProperty {
  id: string;
  error_x_m: number;
  error_y_m: number;
  error_z_m: number;
  total_3d_error_mm: number;
  status: string;
}

export interface LandUseProperty {
  name: string;
  type: string;
  category_code: string;
  category_name_th: string;
  category_name_en: string;
  color: string;
  area: number;
  area_sq_m: number;
  area_rai: number;
  __gm_id?: string;
  __gm_shape?: string;
}

export interface RunwayBufferProperty {
  name: string;
  zone_type: string;
  length: number;
  area: number;
  cost: number;
  color: string;
  fill_opacity: number;
  risk_level: string;
}

export interface RunwaySketchProperty {
  name: string;
  runway_id: string;
  name_th: string;
  length: number;
  color: string;
}

export interface DetectionProperty {
  object_id: string;
  class: string;
  confidence: number;
  model_source?: string;
  has_segmentation?: boolean;
  land_use_zone?: string;
  land_use_name?: string;
  in_runway_safety_buffer?: boolean;
  risk_alert?: string;
  pixel_coordinates: [number, number];
  wgs84_coords: [number, number];
  bbox_polygon: number[][];
  segmentation_polygon?: number[][];
  status: string;
}

export interface NetworkProperty {
  name: string;
  road_type: string;
  lanes: number;
  speed_limit_kmh: number;
  capacity_vph: number;
  length_m: number;
  surface: string;
}

export interface ParkingProperty {
  name: string;
  total_capacity: number;
  occupied_spots: number;
  available_spots: number;
  occupancy_rate_pct: number;
  status: string;
  surface_type: string;
}

export interface SimulationAgent {
  id: string;
  type: string;
  lat: number;
  lon: number;
  heading?: number;
  speed_kmh: number;
  route_id: string;
  route_name?: string;
  in_runway_buffer?: boolean;
}


export interface SimulationTimelineStep {
  time: string;
  decimal_time: number;
  volume_vph: number;
  speed_kmh: number;
  delay_seconds: number;
  vc_ratio: number;
  los: string;
  los_color: string;
  status_th: string;
  congestion_pct: number;
  parking_occupancy_pct: number;
  co2_emissions_kgh: number;
  runway_buffer_intrusion_alert?: boolean;
  active_agents: SimulationAgent[];
}

export interface SimulationData {
  model_metadata: {
    name: string;
    time_range: string;
    corridor: string;
    calibration: string;
  };
  kpi_summary: {
    daily_total_vehicles: number;
    peak_morning_hour: string;
    peak_morning_volume_vph: number;
    peak_evening_hour: string;
    peak_evening_volume_vph: number;
    average_daily_speed_kmh: number;
    average_peak_delay_min: number;
    peak_los: string;
    total_estimated_co2_kg: number;
  };
  timeline: SimulationTimelineStep[];
}

export interface PolicyReportData {
  title: string;
  subtitle: string;
  location: string;
  generated_by: string;
  generated_at: string;
  status: string;
  summary_kpis: {
    drone_survey_accuracy_cm: number;
    gsd_cm: number;
    objects_detected: number;
    peak_hour: string;
    peak_volume_vph: number;
    peak_los: string;
    daily_vehicles: number;
    co2_emissions_kg: number;
  };
  markdown_content: string;
}

export interface DatasetMetadata {
  dataset_name: string;
  location: string;
  report_summary: {
    title: string;
    software: string;
    survey_date: string;
    capture_window: {
      start: string;
      end: string;
      duration: string;
    };
    area_covered_sq_km: number;
    area_covered_sq_m: number;
    processing_time: string;
    drone_camera: {
      model: string;
      resolution: string;
      sensor_type: string;
      focal_length_norm: number;
    };
    reconstruction_stats: {
      total_images: number;
      reconstructed_images: number;
      reconstruction_rate_pct: number;
      sparse_points: number;
      dense_points: number;
      average_gsd_cm: number;
      detected_features_per_image: number;
      reconstructed_features_avg: number;
      reprojection_error_pixels: number;
    };
    accuracy_metrics: {
      horizontal_ce90_m: number;
      vertical_le90_m: number;
      relative_horizontal_ce90_m: number;
      relative_vertical_le90_m: number;
      gps_rms_error_total_m: number;
      gcp_rms_error_total_m: number;
      gcp_rms_x_m: number;
      gcp_rms_y_m: number;
      gcp_rms_z_m: number;
    };
    ground_control_points: {
      id: string;
      error_x_m: number;
      error_y_m: number;
      error_z_m: number;
      relative_pos: [number, number];
    }[];
  };
  georeferencing: {
    image_width: number;
    image_height: number;
    utm_zone: number;
    utm_origin: [number, number];
    pixel_scale: [number, number];
    utm_extents: {
      easting_min: number;
      easting_max: number;
      northing_min: number;
      northing_max: number;
      width_m: number;
      height_m: number;
    };
    bounds_wgs84: [[number, number], [number, number]];
    corners_wgs84: {
      north_west: [number, number];
      north_east: [number, number];
      south_west: [number, number];
      south_east: [number, number];
    };
    center_wgs84: [number, number];
    web_image_url: string;
  };
  webodm_summary?: {
    land_use_stats: {
      total_features: number;
      total_area_sq_m: number;
      total_area_rai: number;
      categories: {
        [code: string]: {
          code: string;
          name_th: string;
          name_en: string;
          color: string;
          features_count: number;
          area_sq_m: number;
          area_rai: number;
          percentage: number;
        };
      };
    };
    buffer_summary: {
      area_sq_m: number;
      length_m: number;
      cost_thb: number;
    };
    survey_marker_count: number;
  };
}

export interface OrchestratorStatus {
  status: string;
  start_time: string;
  end_time?: string;
  agents: {
    DataAgent: { status: string; output: any; error: any };
    AIAgent: { status: string; output: any; error: any };
    LLMAgent: { status: string; output: any; error: any };
    VizAgent: { status: string; output: any; error: any };
  };
  warnings: string[];
  pipeline_version: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export type SimulationScenarioId = "normal" | "rain" | "airshow" | "maintenance" | "green_transit";

export interface SimulationScenario {
  id: SimulationScenarioId;
  name_th: string;
  name_en: string;
  icon: string;
  description_th: string;
  volume_multiplier: number;
  speed_multiplier: number;
  delay_multiplier: number;
  co2_multiplier: number;
  weather: string;
  tag_color: string;
}

export interface DynamicSubagentStatus {
  id: string;
  name: string;
  role_th: string;
  role_en: string;
  type: "vision" | "simulation" | "geospatial" | "llm" | "telemetry" | "orchestrator";
  status: "IDLE" | "RUNNING" | "COMPLETED" | "STANDBY" | "STREAMING";
  latency_ms: number;
  throughput_fps: number;
  tasks_processed: number;
  last_output_summary: string;
  async_worker_id: string;
  cpu_usage_pct: number;
  memory_mb: number;
}

export interface MultiAgentSystemState {
  primary_orchestrator: {
    status: string;
    mode: "DYNAMIC_ASYNC_PARALLEL" | "SEQUENTIAL";
    supervisor: string;
    uptime_seconds: number;
    active_coroutine_count: number;
  };
  subagents: DynamicSubagentStatus[];
  recent_logs: {
    timestamp: string;
    agent_id: string;
    level: "INFO" | "SUCCESS" | "WARN" | "EXEC";
    message: string;
  }[];
}
