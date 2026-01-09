// Automotive System Descriptions
// Educational content sourced from HowStuffWorks, UTI, and automotive industry resources

export const SYSTEM_DESCRIPTIONS = {
    brakes: {
        name: 'Braking System',
        shortDescription: 'Converts kinetic energy to thermal energy through friction to slow or stop the vehicle.',
        fullDescription: `The automotive braking system is a critical safety feature that allows a vehicle to slow down or stop by converting kinetic energy into thermal energy through friction. This process is primarily facilitated by a hydraulic system that amplifies the force applied by the driver.

**Key Components:**

• **Brake Pedal** - The driver's interface to initiate braking
• **Brake Booster** - Uses engine vacuum to amplify pedal force
• **Master Cylinder** - Converts mechanical force into hydraulic pressure
• **Brake Fluid** - Transmits force through the hydraulic system
• **Brake Lines & Hoses** - Network carrying fluid to each wheel

**Disc Brake Components:**
• **Brake Rotor (Disc)** - Metal disc attached to the wheel that rotates with it
• **Brake Caliper** - Houses brake pads and pistons; clamps pads against rotor
• **Brake Pads** - Friction material pressed against the rotor

**Drum Brake Components:**
• **Brake Drum** - Rotating component encasing brake shoes
• **Brake Shoes** - Friction material pressing outward against the drum
• **Wheel Cylinders** - Push brake shoes against the drum

**Anti-lock Braking System (ABS):**
• Wheel Speed Sensors detect individual wheel rotation
• ABS Control Unit processes sensor data
• Hydraulic Control Unit modulates pressure to prevent wheel lock-up`,
        source: 'HowStuffWorks, UTI, Wagner Brake'
    },

    electrical: {
        name: 'Electrical System',
        shortDescription: 'Complex network for power generation, storage, and distribution throughout the vehicle.',
        fullDescription: `The automotive electrical system is a complex network of components essential for a vehicle's operation, encompassing power generation, storage, and distribution systems.

**Power Generation & Storage:**

• **Battery** - Primary energy source (12-volt lead-acid); stores electrical energy to start the engine and power accessories when engine is off
• **Alternator** - Generates electricity while engine runs; recharges battery and supplies power to electrical systems (produces up to 14.8 volts)

**Power Usage:**

• **Starter Motor** - High-amperage electric motor that cranks the engine to start operation
• **Wiring Harness** - Comprehensive network linking all electrical components
• **Fuses** - Safety devices protecting circuits from power surges or short circuits
• **Relays** - Electromechanical switches controlling high-power circuits with low-power signals

**Control Systems:**

• **Voltage Regulator** - Maintains consistent voltage levels
• **Electronic Control Units (ECUs)** - Controls fuel injection, ignition, and other engine operations
• **Sensors** - Detect temperature, pressure, and other parameters
• **Switches** - Allow driver to activate/deactivate electrical components

**Fundamental Concepts:**
• Voltage - Electrical potential measured in volts
• Current - Flow of electrical charge measured in amperes
• Grounding - Return path for current to negative battery terminal`,
        source: 'AutoZone, HowACarWorks, Skillmaker Education'
    },

    suspension: {
        name: 'Suspension System',
        shortDescription: 'Absorbs road shocks, maintains tire contact with road, and provides vehicle control and comfort.',
        fullDescription: `The automotive suspension system is crucial for vehicle control, passenger comfort, and maximizing tire contact with the road. It absorbs and dampens road shocks while maintaining stability.

**Springs - Support vehicle weight and absorb impact:**

• **Coil Springs** - Most common; wound torsion bars that compress and expand
• **Leaf Springs** - Layered metal strips; common in trucks and heavy-duty vehicles
• **Torsion Bars** - Long bars that twist to provide spring rate
• **Air Springs** - Adjustable stiffness via air pressure

**Dampers - Dissipate energy and control oscillations:**

• **Shock Absorbers** - Hydraulic piston/cylinder mechanism converting kinetic energy to heat
• **Struts** - Combines shock absorber and coil spring in single unit; supports vehicle weight and contributes to steering stability

**Linkages & Control Arms:**

• **Control Arms (Wishbones)** - Connect steering knuckle to frame; allow up/down wheel movement while maintaining alignment
• **Steering Knuckle** - Contains wheel hub; attaches to suspension and steering
• **Ball Joints** - Allow rotational movement between components
• **Bushings** - Rubber components reducing friction and absorbing vibrations

**Stabilization:**

• **Stabilizer Bars (Anti-Roll Bars)** - Link opposite suspension sides to reduce body roll during cornering

**Types:**
• **Independent Suspension** - Each wheel moves independently; better traction and comfort
• **Dependent (Rigid Axle)** - Wheels connected by solid axle; simpler and more robust`,
        source: 'HowStuffWorks, UTI, CED Engineering'
    },

    engine: {
        name: 'Engine System',
        shortDescription: 'Internal combustion engine converting fuel\'s chemical energy into mechanical energy.',
        fullDescription: `The internal combustion engine converts the chemical energy of fuel into mechanical energy to power the vehicle through a four-stroke cycle.

**Core Mechanical Components:**

• **Engine Block** - Fundamental housing structure; contains cylinders, coolant and oil passages
• **Cylinders** - Chambers where combustion occurs
• **Pistons** - Move up/down to compress air-fuel mixture and extract power
• **Connecting Rods** - Convert piston's reciprocating motion to rotary motion
• **Crankshaft** - Transforms reciprocating motion into rotation for wheel power
• **Cylinder Head** - Seals combustion chambers; houses valves and spark plugs
• **Valves (Intake/Exhaust)** - Control gas flow in and out of cylinders
• **Camshaft** - Controls precise timing of valve opening/closing
• **Piston Rings** - Prevent pressure leaks and oil entry into combustion chamber

**Essential Operating Systems:**

• **Fuel System** - Stores and delivers fuel (tank, pump, injectors)
• **Ignition System** - Ignites air-fuel mixture (spark plugs, coil)
• **Air Intake System** - Manages airflow into engine
• **Exhaust System** - Expels burned gases
• **Lubrication System** - Circulates oil to reduce friction (pump, filter, passages)
• **Cooling System** - Dissipates heat (coolant, radiator)
• **Starting System** - Starter motor cranks engine

**Four-Stroke Cycle:**
1. **Intake** - Piston down, intake valve open, draws air-fuel mixture
2. **Compression** - Both valves closed, piston compresses mixture
3. **Power** - Spark ignites mixture, explosion forces piston down
4. **Exhaust** - Exhaust valve opens, piston pushes out burned gases`,
        source: 'Britannica, Wikipedia, Defense.gov'
    },

    steering: {
        name: 'Steering System',
        shortDescription: 'Translates steering wheel rotation into linear motion to turn vehicle wheels.',
        fullDescription: `The rack and pinion steering system translates the rotational motion of the steering wheel into the linear motion required to turn the vehicle's wheels. It's widely adopted in modern vehicles due to its simplicity, compact design, and precise steering response.

**Core Components:**

• **Steering Wheel** - Driver's primary interface for turning
• **Steering Column (Shaft)** - Connects steering wheel to pinion gear; transmits rotational input
• **Pinion Gear** - Small circular gear at end of steering column; meshes with rack
• **Rack** - Linear toothed bar in metal tube; moves left/right as pinion rotates
• **Tie Rods** - Connect rack ends to steering knuckles; transfer linear motion to wheels
• **Housing** - Metal tube enclosing and protecting the assembly

**How It Works:**

1. Driver turns steering wheel
2. Steering column rotates pinion gear
3. Pinion gear meshes with rack teeth
4. Rack moves horizontally left or right
5. Tie rods transfer motion to steering knuckles
6. Wheels turn in desired direction

**Power Steering Systems:**

• **Hydraulic Power Steering (HPS)** - Uses hydraulic cylinder and power steering pump to amplify steering force
• **Electric Power Steering (EPS)** - Electric motor provides steering assistance

**Advantages:**
• Simple and compact design
• Precise steering response
• Reduced driver effort
• Fewer complex linkages`,
        source: 'HowStuffWorks, Car and Driver, JD Power'
    },

    transmission: {
        name: 'Transmission System',
        shortDescription: 'Transmits engine power to wheels through various gear ratios for different driving conditions.',
        fullDescription: `The transmission system transmits power from the engine to the wheels, enabling the vehicle to move and change speeds by providing various gear ratios that balance torque and speed.

**Manual Transmission Components:**

• **Clutch** - Connects/disconnects engine from transmission for gear changes
  - Pressure plate, clutch disc, and flywheel
• **Gear Shift Lever** - Driver interface for selecting gear ratios
• **Gearbox** - Houses various gear sets for different ratios
• **Input Shaft** - Connected to engine via clutch; rotates at engine speed
• **Countershaft (Layshaft)** - Carries gears driven by input shaft
• **Output Shaft** - Transmits power to wheels via differential
• **Synchronizers** - Match shaft speeds for smooth gear engagement
• **Selector Fork** - Moves collars to engage specific gears

**Automatic Transmission Components:**

• **Torque Converter** - Fluid coupling replacing manual clutch
  - Pump (Impeller) - Sends fluid to turbine
  - Turbine - Spun by fluid, transmits power
  - Stator - Redirects fluid to multiply torque
• **Planetary Gear Sets** - Sun gear, planet gears, and ring gear create different ratios
• **Valve Body** - "Brain" directing hydraulic fluid for gear shifts
• **Hydraulic System** - Pressurized fluid engages clutches and bands
• **Clutches & Bands** - Control planetary gear set components
• **Transmission Control Unit (TCU)** - Electronic control for optimized shifts`,
        source: 'GearStar, Wikipedia, Mister Transmission'
    }
};

export default SYSTEM_DESCRIPTIONS;
