"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-27 05:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(32), default='student', index=True),
        sa.Column('status', sa.String(32), default='active'),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(32), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Student Profiles table
    op.create_table(
        'student_profiles',
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('usn', sa.String(32), unique=True, index=True, nullable=False),
        sa.Column('college_email', sa.String(255), nullable=True),
        sa.Column('campus', sa.String(100), default='NIE North Campus'),
        sa.Column('branch', sa.String(64), default='Computer Science & Engineering'),
        sa.Column('semester', sa.Integer(), default=5),
        sa.Column('section', sa.String(8), default='A'),
        sa.Column('academic_year', sa.String(32), default='2024-2025'),
        sa.Column('emergency_contact', sa.String(32), nullable=True),
        sa.Column('privacy_shield_active', sa.Boolean(), default=True),
        sa.Column('points_balance', sa.Integer(), default=0),
        sa.Column('recovered_count', sa.Integer(), default=0),
        sa.Column('streak_days', sa.Integer(), default=0),
        sa.Column('badge_level', sa.String(64), default='Campus Guardian Lv. 1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Campus Locations
    op.create_table(
        'campus_locations',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('campus', sa.String(100), default='NIE North Campus'),
        sa.Column('zone', sa.String(64), default='Academic Zone'),
        sa.Column('building', sa.String(100), nullable=True),
        sa.Column('floor', sa.String(64), nullable=True),
        sa.Column('room', sa.String(64), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('location_type', sa.String(64), default='ACADEMIC_BLOCK'),
        sa.Column('has_collection_desk', sa.Boolean(), default=False),
        sa.Column('item_count', sa.Integer(), default=0),
        sa.Column('geometry_geojson', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Item Reports
    op.create_table(
        'item_reports',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('report_type', sa.String(16), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False, index=True),
        sa.Column('category', sa.String(64), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('incident_place', sa.String(255), nullable=False),
        sa.Column('current_location', sa.String(255), nullable=True),
        sa.Column('place_id', sa.String(64), sa.ForeignKey('campus_locations.id', ondelete='SET NULL'), nullable=True),
        sa.Column('event_date', sa.String(32), nullable=True),
        sa.Column('event_time', sa.String(32), nullable=True),
        sa.Column('brand', sa.String(100), nullable=True),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('color', sa.String(64), nullable=True),
        sa.Column('material', sa.String(64), nullable=True),
        sa.Column('size', sa.String(64), nullable=True),
        sa.Column('distinguishing_marks', sa.Text(), nullable=True),
        sa.Column('serial_number', sa.String(100), nullable=True),
        sa.Column('secret_verification_clue', sa.Text(), nullable=True),
        sa.Column('status', sa.String(32), default='SUBMITTED', index=True),
        sa.Column('reward_points_eligible', sa.Integer(), default=50),
        sa.Column('is_anonymous', sa.Boolean(), default=False),
        sa.Column('reporter_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('reporter_name', sa.String(255), nullable=True),
        sa.Column('reporter_usn', sa.String(32), nullable=True),
        sa.Column('text_embedding', sa.Text(), nullable=True),
        sa.Column('image_embedding', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, index=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Item Images
    op.create_table(
        'item_images',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('report_id', sa.String(64), sa.ForeignKey('item_reports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('storage_path', sa.Text(), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('source_type', sa.String(32), default='USER_UPLOADED'),
        sa.Column('mime_type', sa.String(64), default='image/jpeg'),
        sa.Column('file_size', sa.Integer(), default=0),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('is_primary', sa.Boolean(), default=False),
        sa.Column('is_reference', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Potential Matches
    op.create_table(
        'potential_matches',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('lost_report_id', sa.String(64), sa.ForeignKey('item_reports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('found_report_id', sa.String(64), sa.ForeignKey('item_reports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('similarity_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('visual_score', sa.Float(), default=0.0),
        sa.Column('text_score', sa.Float(), default=0.0),
        sa.Column('location_score', sa.Float(), default=0.0),
        sa.Column('time_score', sa.Float(), default=0.0),
        sa.Column('category_score', sa.Float(), default=0.0),
        sa.Column('attribute_score', sa.Float(), default=0.0),
        sa.Column('reasons_json', sa.Text(), default='[]'),
        sa.Column('match_clues_json', sa.Text(), default='[]'),
        sa.Column('status', sa.String(32), default='PENDING_REVIEW', index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Verification Cases
    op.create_table(
        'verification_cases',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('match_id', sa.String(64), sa.ForeignKey('potential_matches.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('lost_report_id', sa.String(64), sa.ForeignKey('item_reports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('found_report_id', sa.String(64), sa.ForeignKey('item_reports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('claimant_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('finder_id', sa.String(64), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('status', sa.String(32), default='AWAITING_CLAIMANT', index=True),
        sa.Column('confidence_rating', sa.String(32), default='Moderate'),
        sa.Column('attempts_count', sa.Integer(), default=0),
        sa.Column('max_attempts', sa.Integer(), default=3),
        sa.Column('manual_review_notes', sa.Text(), nullable=True),
        sa.Column('assigned_staff', sa.String(255), nullable=True),
        sa.Column('handover_otp', sa.String(16), nullable=True),
        sa.Column('handover_location', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Verification Questions
    op.create_table(
        'verification_questions',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('case_id', sa.String(64), sa.ForeignKey('verification_cases.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('expected_answer_normalized', sa.Text(), nullable=False),
        sa.Column('provided_answer', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Verification Attempts
    op.create_table(
        'verification_attempts',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('case_id', sa.String(64), sa.ForeignKey('verification_cases.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('answers_json', sa.Text(), nullable=False),
        sa.Column('is_success', sa.Boolean(), default=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(64), nullable=True),
        sa.Column('attempt_timestamp', sa.DateTime(), nullable=True)
    )

    # Messages
    op.create_table(
        'messages',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('case_id', sa.String(64), sa.ForeignKey('verification_cases.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('sender_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('sender_name', sa.String(255), nullable=False),
        sa.Column('sender_role', sa.String(32), default='student'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('read', sa.Boolean(), default=False),
        sa.Column('is_system_message', sa.Boolean(), default=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True, index=True)
    )

    # Handover Records
    op.create_table(
        'handover_records',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('case_id', sa.String(64), sa.ForeignKey('verification_cases.id', ondelete='CASCADE'), unique=True, nullable=False, index=True),
        sa.Column('method', sa.String(64), default='NIE_LOST_AND_FOUND_OFFICE'),
        sa.Column('location_name', sa.String(255), nullable=False),
        sa.Column('scheduled_date', sa.String(32), nullable=True),
        sa.Column('scheduled_time_window', sa.String(64), nullable=True),
        sa.Column('otp_code', sa.String(16), nullable=True),
        sa.Column('qr_verification_code', sa.String(64), nullable=True),
        sa.Column('is_finder_confirmed', sa.Boolean(), default=False),
        sa.Column('finder_confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('is_claimant_confirmed', sa.Boolean(), default=False),
        sa.Column('claimant_confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('is_staff_witnessed', sa.Boolean(), default=False),
        sa.Column('witnessing_staff_id', sa.String(64), nullable=True),
        sa.Column('status', sa.String(32), default='SCHEDULED', index=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Reward Transactions
    op.create_table(
        'reward_transactions',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('case_id', sa.String(64), sa.ForeignKey('verification_cases.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(255), nullable=False),
        sa.Column('badge_awarded', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, index=True)
    )

    # Milestones
    op.create_table(
        'milestones',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('badge_code', sa.String(64), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('certificate_number', sa.String(64), unique=True, nullable=True),
        sa.Column('achieved_at', sa.DateTime(), nullable=True)
    )

    # Notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('type', sa.String(32), default='SYSTEM', index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('related_case_id', sa.String(64), nullable=True, index=True),
        sa.Column('link_url', sa.String(255), nullable=True),
        sa.Column('read', sa.Boolean(), default=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, index=True)
    )

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(64), primary_key=True, index=True),
        sa.Column('actor_id', sa.String(64), nullable=True, index=True),
        sa.Column('actor_name', sa.String(255), nullable=True),
        sa.Column('actor_role', sa.String(32), default='STUDENT'),
        sa.Column('event_type', sa.String(64), nullable=False, index=True),
        sa.Column('case_id', sa.String(64), nullable=True, index=True),
        sa.Column('status', sa.String(32), default='SUCCESS'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('metadata_json', sa.Text(), default='{}'),
        sa.Column('timestamp', sa.DateTime(), nullable=True, index=True)
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('notifications')
    op.drop_table('milestones')
    op.drop_table('reward_transactions')
    op.drop_table('handover_records')
    op.drop_table('messages')
    op.drop_table('verification_attempts')
    op.drop_table('verification_questions')
    op.drop_table('verification_cases')
    op.drop_table('potential_matches')
    op.drop_table('item_images')
    op.drop_table('item_reports')
    op.drop_table('campus_locations')
    op.drop_table('student_profiles')
    op.drop_table('users')
