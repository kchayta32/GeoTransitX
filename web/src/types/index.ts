export interface GcpProperty {
  id: string;
  error_x_m: number;
  error_y_m: number;
  error_z_m: number;
  total_3d_error_mm: number;
  status: string;
}

export interface DetectionProperty {
  object_id: string;
  class: string;
  confidence: number;
  pixel_coordinates: [number, number];
  wgs84_coords: [number, number];
  bbox_polygon: number[][];
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
  speed_kmh: number;
  route_id: string;
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
